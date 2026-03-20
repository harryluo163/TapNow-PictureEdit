<template>
  <div ref="container" class="lighting-scene-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// ============ Props ============
const props = defineProps({
  imageUrl: String
})

const emit = defineEmits(['drag', 'dragEnd'])

// ============ 响应式引用 ============
const container = ref(null)

// ============ Three.js 对象 ============
let scene, camera, renderer
let photoGroup, lightGroup
let connectionLine  // 灯光到中心的连接线

// ============ 拖动状态 ============
let isDragging = false
let lastX = 0, lastY = 0

// ============ 灯光角度 ============
const lightSphereRotateX = ref(0)
const lightSphereRotateY = ref(0)

// ============ 初始化 Three.js ============
const initThree = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1e1e20)

  // 创建相机
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
  camera.position.z = 5

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(120, 120)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.autoClear = false
  renderer.sortObjects = true
  container.value.appendChild(renderer.domElement)

  // 添加光照
  setupLighting()

  // 创建3D对象
  createPhoto()
  createLightModel()

  // 开始动画循环
  animate()
}

// ============ 设置光照 ============
const setupLighting = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)

  // 主方向光（可移动的灯光）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(3, 5, 3)
  scene.add(directionalLight)

  // 顶部补光
  const topLight = new THREE.DirectionalLight(0xffffff, 0.4)
  topLight.position.set(0, 5, 0)
  scene.add(topLight)
}

// ============ 创建照片立方体 ============
const createPhoto = () => {
  photoGroup = new THREE.Group()

  const faceSize = 0.8
  const cornerRadius = 0.15
  const thickness = 0.02
  const halfSize = faceSize / 2
  const curveSegments = 8

  // 创建圆角矩形 Shape
  const createRoundedRectShape = (width, height, radius, curveSegments) => {
    const shape = new THREE.Shape()
    const halfWidth = width / 2
    const halfHeight = height / 2

    shape.moveTo(-halfWidth + radius, -halfHeight)
    shape.lineTo(halfWidth - radius, -halfHeight)
    shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius)
    shape.lineTo(halfWidth, halfHeight - radius)
    shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight)
    shape.lineTo(-halfWidth + radius, halfHeight)
    shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius)
    shape.lineTo(-halfWidth, -halfHeight + radius)
    shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight)

    return shape
  }

  const shape = createRoundedRectShape(faceSize, faceSize, cornerRadius, curveSegments)
  const extrudeSettings = {
    steps: 1,
    depth: thickness,
    bevelEnabled: false
  }
  const faceGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  faceGeometry.center()

  // 修复纹理坐标
  const uvAttribute = faceGeometry.attributes.uv
  const positionAttribute = faceGeometry.attributes.position

  for (let i = 0; i < positionAttribute.count; i++) {
    const z = positionAttribute.getZ(i)
    if (z > 0) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)
      uvAttribute.setXY(i, (x / faceSize) + 0.5, (y / faceSize) + 0.5)
    }
  }
  uvAttribute.needsUpdate = true

  const frontFace = new THREE.Mesh(faceGeometry, new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  }))
  frontFace.position.set(0, 0, 0)
  photoGroup.add(frontFace)

  photoGroup.renderOrder = 0
  scene.add(photoGroup)
}

// ============ 创建灯光模型 ============
const createLightModel = () => {
  lightGroup = new THREE.Group()

  // 灯光主体（发光的球体）
  const lightGeometry = new THREE.SphereGeometry(0.08, 32, 32)
  const lightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 1
  })
  const light = new THREE.Mesh(lightGeometry, lightMaterial)
  lightGroup.add(light)

  // 添加发光效果（稍大的半透明球体）
  const glowGeometry = new THREE.SphereGeometry(0.12, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.3
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  lightGroup.add(glow)

  lightGroup.position.z = 1.2
  lightGroup.lookAt(0, 0, 0)
  scene.add(lightGroup)

  // 创建灯光到中心的连接线
  createConnectionLine()
}

// ============ 创建连接线 ============
const createConnectionLine = () => {
  const length = 1.2
  const radius = 0.003

  const geometry = new THREE.CylinderGeometry(radius, radius, length, 8)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    depthTest: false,
    depthWrite: false,
    transparent: false
  })

  connectionLine = new THREE.Mesh(geometry, material)
  connectionLine.position.z = length / 2
  connectionLine.visible = true
  connectionLine.renderOrder = 1000
  scene.add(connectionLine)
}

// ============ 更新灯光位置 ============
const updateLightTransform = () => {
  if (lightGroup) {
    const radius = 1.2
    const theta = THREE.MathUtils.degToRad(-lightSphereRotateY.value)
    const phi = THREE.MathUtils.degToRad(-lightSphereRotateX.value)

    lightGroup.position.x = radius * Math.cos(phi) * Math.sin(theta)
    lightGroup.position.y = radius * Math.sin(phi)
    lightGroup.position.z = radius * Math.cos(phi) * Math.cos(theta)
    lightGroup.lookAt(0, 0, 0)

    updateConnectionLine()
  }
}

// ============ 更新连接线 ============
const updateConnectionLine = () => {
  if (connectionLine && lightGroup) {
    const from = new THREE.Vector3(0, 0, 0)
    const to = new THREE.Vector3(lightGroup.position.x, lightGroup.position.y, lightGroup.position.z)

    const length = from.distanceTo(to)
    const midPoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)

    connectionLine.position.copy(midPoint)

    const direction = new THREE.Vector3().subVectors(to, from).normalize()
    const up = new THREE.Vector3(0, 1, 0)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction)

    connectionLine.setRotationFromQuaternion(quaternion)
    connectionLine.scale.set(1, length / 1.2, 1)
  }
}

// ============ 更新照片纹理 ============
const updatePhotoTexture = () => {
  if (props.imageUrl && photoGroup && photoGroup.children.length > 0) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 512
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      const imgAspect = img.width / img.height
      const drawWidth = size
      const drawHeight = size / imgAspect
      const drawX = 0
      const drawY = (size - drawHeight) / 2

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping

      if (photoGroup.children[0] && photoGroup.children[0].material) {
        photoGroup.children[0].material.map = texture
        photoGroup.children[0].material.needsUpdate = true
      }
    }
    img.src = props.imageUrl
  }
}

// ============ 动画循环 ============
const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)

  if (connectionLine && connectionLine.visible) {
    renderer.clearDepth()
    renderer.render(scene, camera)
  }
}

// ============ 鼠标事件处理 ============
const handleMouseDown = (e) => {
  isDragging = true
  lastX = e.clientX
  lastY = e.clientY
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e) => {
  if (!isDragging) return
  const deltaX = e.clientX - lastX
  const deltaY = e.clientY - lastY

  lightSphereRotateY.value += deltaX * 0.5
  lightSphereRotateX.value += deltaY * 0.5

  // 限制垂直角度
  lightSphereRotateX.value = Math.max(-80, Math.min(80, lightSphereRotateX.value))

  emit('drag', deltaX, deltaY)
  lastX = e.clientX
  lastY = e.clientY
}

const handleMouseUp = () => {
  isDragging = false
  emit('dragEnd')
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// ============ 触摸事件处理 ============
const handleTouchStart = (e) => {
  isDragging = true
  lastX = e.touches[0].clientX
  lastY = e.touches[0].clientY
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}

const handleTouchMove = (e) => {
  if (!isDragging) return
  const deltaX = e.touches[0].clientX - lastX
  const deltaY = e.touches[0].clientY - lastY

  lightSphereRotateY.value += deltaX * 0.5
  lightSphereRotateX.value += deltaY * 0.5

  lightSphereRotateX.value = Math.max(-80, Math.min(80, lightSphereRotateX.value))

  emit('drag', deltaX, deltaY)
  lastX = e.touches[0].clientX
  lastY = e.touches[0].clientY
}

const handleTouchEnd = () => {
  isDragging = false
  emit('dragEnd')
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

// ============ 监听器 ============
watch(() => [lightSphereRotateX.value, lightSphereRotateY.value], updateLightTransform)

watch(() => props.imageUrl, updatePhotoTexture)

// ============ 生命周期 ============
onMounted(() => {
  initThree()
  const canvas = renderer.domElement
  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('touchstart', handleTouchStart)
  updatePhotoTexture()
  updateLightTransform()
})

onUnmounted(() => {
  const canvas = renderer.domElement
  canvas.removeEventListener('mousedown', handleMouseDown)
  canvas.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  if (renderer) {
    renderer.dispose()
    container.value?.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.lighting-scene-container {
  width: 120px;
  height: 120px;
  cursor: grab;
  user-select: none;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #333;
}

.lighting-scene-container:active {
  cursor: grabbing;
}
</style>