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
let photoGroup, lightGroup, sphereGroup
let connectionLine  // 灯光到中心的连接线
let lightRays = []   // 灯光光线数组
let spotLight       // 聚光灯

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
  renderer.setSize(230, 230)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.autoClear = false
  renderer.sortObjects = true
  container.value.appendChild(renderer.domElement)

  // 添加光照
  setupLighting()

  // 创建3D对象
  createPhoto()
  createSphereGrid()
  createLightModel()

  // 开始动画循环
  animate()
}

// ============ 设置光照 ============
const setupLighting = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
  scene.add(ambientLight)

  // 主方向光（可移动的灯光）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(3, 5, 3)
  scene.add(directionalLight)

  // 顶部补光
  const topLight = new THREE.DirectionalLight(0xffffff, 0.3)
  topLight.position.set(0, 5, 0)
  scene.add(topLight)

  // 添加聚光灯来照亮中心照片
  spotLight = new THREE.SpotLight(0xffffaa, 2)
  spotLight.position.set(0, 0, 3)
  spotLight.angle = Math.PI / 6
  spotLight.penumbra = 0.3
  spotLight.decay = 1.5
  spotLight.distance = 10
  spotLight.target.position.set(0, 0, 0)
  scene.add(spotLight)
  scene.add(spotLight.target)
}

// ============ 创建照片立方体 ============
const createPhoto = () => {
  photoGroup = new THREE.Group()

  const faceSize =1.5
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

  const frontFace = new THREE.Mesh(faceGeometry, new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.1
  }))
  frontFace.position.set(0, 0, 0)
  photoGroup.add(frontFace)

  photoGroup.renderOrder = 0
  scene.add(photoGroup)
}

// ============ 创建球体网格 ============
const createSphereGrid = () => {
  sphereGroup = new THREE.Group()
  const radius = 1.7

  // 在上下之间每隔18度画一条水平线（类似纬线）
  for (let lat = -90; lat <= 90; lat += 18) {
    const phi = (90 - lat) * (Math.PI / 180)
    const latRadius = radius * Math.sin(phi)
    const y = radius * Math.cos(phi)

    const curve = new THREE.EllipseCurve(0, 0, latRadius, latRadius, 0, 2 * Math.PI, false, 0)
    const points = curve.getPoints(50)
    const geo = new THREE.BufferGeometry().setFromPoints(points)

    const mat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.2 })
    const ellipse = new THREE.Line(geo, mat)
    ellipse.rotation.x = Math.PI / 2
    ellipse.position.y = y
    sphereGroup.add(ellipse)
  }

  // 在左右之间每隔9度画一条垂直线（类似经线）
  for (let lon = -90; lon <= 90; lon += 20) {
    const theta = lon * (Math.PI / 180)
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0)
    const points = curve.getPoints(50)
    const geo = new THREE.BufferGeometry().setFromPoints(points)

    const mat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.2 })
    const ellipse = new THREE.Line(geo, mat)
    ellipse.rotation.x = 0
    ellipse.rotation.y = theta
    sphereGroup.add(ellipse)
  }

  scene.add(sphereGroup)
}

// ============ 创建灯光模型 ============
const createLightModel = () => {
  lightGroup = new THREE.Group()

  // 灯光主体（发光的球体）- 增大尺寸
  const lightGeometry = new THREE.SphereGeometry(0.15, 32, 32)
  const lightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    transparent: true,
    opacity: 1
  })
  const light = new THREE.Mesh(lightGeometry, lightMaterial)
  lightGroup.add(light)

  // 添加发光效果（稍大的半透明球体）
  const glowGeometry = new THREE.SphereGeometry(0.25, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    transparent: true,
    opacity: 0.4
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  lightGroup.add(glow)

  // 添加外层光晕
  const outerGlowGeometry = new THREE.SphereGeometry(0.35, 32, 32)
  const outerGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    transparent: true,
    opacity: 0.15
  })
  const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial)
  lightGroup.add(outerGlow)

  lightGroup.position.z = 1.2
  lightGroup.lookAt(0, 0, 0)
  scene.add(lightGroup)

  // 创建4个主要顶点（在球体网格上）
  const sphereRadius = 1.7
  const vertices = [
    new THREE.Vector3(0, sphereRadius, 0),         // 上 (0)
    new THREE.Vector3(0, -sphereRadius, 0),        // 下 (1)
    new THREE.Vector3(sphereRadius, 0, 0),         // 右 (2)
    new THREE.Vector3(-sphereRadius, 0, 0)         // 左 (3)
  ]

  // 绘制顶点标记
  vertices.forEach((vertex, index) => {
    const markerGeometry = new THREE.SphereGeometry(0.06, 16, 16)
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.7
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.copy(vertex)
    sphereGroup.add(marker)  // 添加到 sphereGroup，让它随球体一起旋转
  })

  // 创建灯光到中心的连接线（多条线模拟光束）
  createLightRays()
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

// ============ 创建灯光光线（多条线模拟光束） ============
const createLightRays = () => {
  const rayCount = 200  // 光线数量
  const raySpread = 0.6  // 光线在目标处的扩散半径

  for (let i = 0; i < rayCount; i++) {
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.LineBasicMaterial({
      color: 0xffffaa,
      transparent: true,
      opacity: 0.4,
      depthTest: false,
      depthWrite: false
    })

    const ray = new THREE.Line(geometry, material)
    ray.renderOrder = 999

    // 为每条光线计算一个偏移角度
    const angle = (i / rayCount) * Math.PI * 2
    const offset = new THREE.Vector3(
      Math.cos(angle) * raySpread,
      Math.sin(angle) * raySpread,
      0
    )
    ray.userData.offset = offset  // 存储偏移量
    ray.userData.length = 1.2     // 存储光线长度

    lightRays.push(ray)
    scene.add(ray)
  }
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

    // 更新聚光灯位置，使其跟随灯光球体
    if (spotLight) {
      spotLight.position.copy(lightGroup.position)
      spotLight.target.position.set(0, 0, 0)
    }

    updateConnectionLine()
    updateLightRays()
  }

  // 更新球网格旋转（与灯光旋转相反，形成相对运动效果）
  if (sphereGroup) {
    sphereGroup.rotation.x = THREE.MathUtils.degToRad(-lightSphereRotateX.value)
    sphereGroup.rotation.y = THREE.MathUtils.degToRad(-lightSphereRotateY.value)
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

// ============ 更新灯光光线 ============
const updateLightRays = () => {
  if (lightRays.length === 0 || !lightGroup) return

  lightRays.forEach(ray => {
    const from = new THREE.Vector3(lightGroup.position.x, lightGroup.position.y, lightGroup.position.z)
    const to = new THREE.Vector3(0, 0, 0)

    // 在目标位置添加偏移，形成光锥效果
    const offset = ray.userData.offset.clone()
    // 将偏移量旋转到当前灯光方向
    const direction = new THREE.Vector3().subVectors(to, from).normalize()
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)
    offset.applyQuaternion(quaternion)

    to.add(offset)

    const points = [from, to]
    ray.geometry.setFromPoints(points)
  })
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

  // 渲染连接线和光线（在顶层）
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
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

const handleTouchMove = (e) => {
  if (!isDragging) return
  e.preventDefault() // 防止页面滚动
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
  // 在容器上监听事件，而不是 canvas
  if (container.value) {
    container.value.addEventListener('mousedown', handleMouseDown)
    container.value.addEventListener('touchstart', handleTouchStart, { passive: false })
  }
  updatePhotoTexture()
  updateLightTransform()
})

onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener('mousedown', handleMouseDown)
    container.value.removeEventListener('touchstart', handleTouchStart)
  }
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)

  // 清理光线对象
  lightRays.forEach(ray => {
    scene.remove(ray)
    ray.geometry.dispose()
    ray.material.dispose()
  })
  lightRays = []

  if (renderer) {
    renderer.dispose()
    container.value?.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.lighting-scene-container {
  width: 250px;
  height: 250px;


  border: 1px solid #333;


}

.lighting-scene-container:active {
  cursor: grabbing;
}

.lighting-scene-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
