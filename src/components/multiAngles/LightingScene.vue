<template>
  <div ref="container" class="lighting-scene-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

// ============ Props ============
const props = defineProps({
  imageUrl: String,
  brightness: { type: Number, default: 50 },
  colorTemp: { type: Number, default: 5600 }
})

const emit = defineEmits(['drag', 'dragEnd'])

// ============ 响应式引用 ============
const container = ref(null)

// ============ Three.js 对象 ============
let scene, camera, renderer
let photoGroup, lightGroup, sphereGroup
let lightRays = []
let spotLight

// ============ 拖动状态 ============
let isDragging = false
let lastX = 0, lastY = 0

// ============ 灯光角度 ============
const lightSphereRotateX = ref(0)
const lightSphereRotateY = ref(0)

// ============ 初始化 Three.js ============
const initThree = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1e1e20)

  camera = new THREE.PerspectiveCamera(58, 1, 1, 1000)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(247, 247)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.autoClear = false
  renderer.sortObjects = true
  container.value.appendChild(renderer.domElement)

  setupLighting()
  createPhoto()
  createSphereGrid()
  createLightModel()
  animate()
}

// ============ 设置光照 ============
const setupLighting = () => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(3, 5, 3)
  scene.add(directionalLight)

  const topLight = new THREE.DirectionalLight(0xffffff, 0.3)
  topLight.position.set(0, 5, 0)
  scene.add(topLight)

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

// ============ 创建照片 ============
const createPhoto = () => {
  photoGroup = new THREE.Group()

  const faceSize = 0.9
  const cornerRadius = 0.15
  const thickness = 0.02

  const createRoundedRectShape = (width, height, radius) => {
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

  const shape = createRoundedRectShape(faceSize, faceSize, cornerRadius)
  const extrudeSettings = { steps: 1, depth: thickness, bevelEnabled: false }
  const faceGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  faceGeometry.center()

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
  photoGroup.add(frontFace)
  photoGroup.renderOrder = 0
  scene.add(photoGroup)
}

// ============ 创建球体网格 ============
const createSphereGrid = () => {
  sphereGroup = new THREE.Group()
  const radius = 1.7

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

  sphereGroup.renderOrder = 50
  scene.add(sphereGroup)
}

// ============ 创建灯光模型 ============
const createLightModel = () => {
  lightGroup = new THREE.Group()

  const lightGeometry = new THREE.SphereGeometry(0.1, 32, 32)
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.4,
    metalness: 0.3
  })
  const light = new THREE.Mesh(lightGeometry, lightMaterial)
  lightGroup.add(light)

  const innerLight = new THREE.PointLight(0xffffff, 3, 0.1)
  innerLight.position.set(0, 0, -0.1)
  lightGroup.add(innerLight)

  lightGroup.position.z = 1.2
  lightGroup.lookAt(0, 0, 0)
  lightGroup.renderOrder = 100
  scene.add(lightGroup)

  createLightRays()
}

// ============ 创建灯光光线 ============
const createLightRays = () => {
  const rayCount = 400
  const raySpread = 0.7

  const rayMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffaa) },
      brightness: { value: 0.5 }
    },
    vertexShader: `
      varying float vAlpha;
      void main() {
        vAlpha = position.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float brightness;
      varying float vAlpha;
      void main() {
        float alpha = smoothstep(-1.0, 1.0, vAlpha);
        gl_FragColor = vec4(color, alpha * 0.15 * brightness * 2.0);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })

  for (let i = 0; i < rayCount; i++) {
    const geometry = new THREE.BufferGeometry()
    const ray = new THREE.Line(geometry, rayMaterial.clone())
    ray.material.uniforms.color = { value: new THREE.Color(0xffffaa) }
    ray.material.uniforms.brightness = { value: 0.5 }
    ray.renderOrder = 999

    const angle = (i / rayCount) * Math.PI * 2
    const offset = new THREE.Vector3(
      Math.cos(angle) * raySpread,
      Math.sin(angle) * raySpread,
      0
    )
    ray.userData.offset = offset
    ray.userData.length = 1.2

    lightRays.push(ray)
    scene.add(ray)
  }
}

// ============ 更新灯光位置 ============
const updateLightTransform = () => {
  if (lightGroup) {
    const radius = 1.64
    const theta = THREE.MathUtils.degToRad(-lightSphereRotateY.value)
    const phi = THREE.MathUtils.degToRad(-lightSphereRotateX.value)

    lightGroup.position.x = radius * Math.cos(phi) * Math.sin(theta)
    lightGroup.position.y = radius * Math.sin(phi)
    lightGroup.position.z = radius * Math.cos(phi) * Math.cos(theta)
    lightGroup.lookAt(0, 0, 0)

    if (spotLight) {
      spotLight.position.copy(lightGroup.position)
      spotLight.target.position.set(0, 0, 0)
    }

    updateLightRays()
  }

  if (sphereGroup) {
    sphereGroup.rotation.x = THREE.MathUtils.degToRad(-lightSphereRotateX.value)
    sphereGroup.rotation.y = THREE.MathUtils.degToRad(-lightSphereRotateY.value)
  }
}

// ============ 更新灯光光线 ============
const updateLightRays = () => {
  if (lightRays.length === 0 || !lightGroup) return

  const lightRadius = 0.1

  lightRays.forEach(ray => {
    const from = new THREE.Vector3(lightGroup.position.x, lightGroup.position.y, lightGroup.position.z)
    const to = new THREE.Vector3(0, 0, 0)

    const direction = new THREE.Vector3().subVectors(to, from).normalize()

    const worldDirection = new THREE.Vector3()
    lightGroup.getWorldDirection(worldDirection)
    worldDirection.negate()

    const surfacePoint = new THREE.Vector3().copy(from).add(worldDirection.multiplyScalar(lightRadius))

    const offset = ray.userData.offset.clone()
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)
    offset.applyQuaternion(quaternion)

    to.add(offset)

    const positions = new Float32Array([
      surfacePoint.x, surfacePoint.y, 1.0,
      to.x, to.y, -1.0
    ])

    ray.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    ray.geometry.attributes.position.needsUpdate = true
  })
}

// ============ 更新灯光亮度 ============
const updateLightBrightness = () => {
  if (!lightGroup) return

  const innerLight = lightGroup.children.find(child => child instanceof THREE.PointLight)
  if (innerLight) {
    innerLight.intensity = (props.brightness / 130) * 6
  }

  if (spotLight) {
    spotLight.intensity = (props.brightness / 130) * 3
  }

  const brightnessValue = props.brightness / 130
  lightRays.forEach(ray => {
    if (ray.material.uniforms.brightness) {
      ray.material.uniforms.brightness.value = brightnessValue
    }
  })
}

// ============ 更新灯光色温 ============
const updateLightColorTemp = () => {
  if (!lightGroup) return

  const color = new THREE.Color()
  color.setHSL(0, 0, 1)

  const temp = props.colorTemp
  let r, g, b

  if (temp <= 6600) {
    r = 255
    g = 99.4708025861 * Math.log(temp) - 161.1195681661
    if (temp <= 2000) {
      b = 0
    } else {
      b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307
    }
  } else {
    r = 329.698727446 * Math.pow(temp - 60, -0.1332047592)
    g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492)
    b = 255
  }

  color.setRGB(
    Math.min(255, Math.max(0, r)) / 255,
    Math.min(255, Math.max(0, g)) / 255,
    Math.min(255, Math.max(0, b)) / 255
  )

  const innerLight = lightGroup.children.find(child => child instanceof THREE.PointLight)
  if (innerLight) {
    innerLight.color = color
  }

  if (spotLight) {
    spotLight.color = color
  }

  lightRays.forEach(ray => {
    if (ray.material.uniforms.color) {
      ray.material.uniforms.color.value = color
    }
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

  lightSphereRotateY.value -= deltaX * 0.5
  lightSphereRotateX.value += deltaY * 0.5
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
  e.preventDefault()
  const deltaX = e.touches[0].clientX - lastX
  const deltaY = e.touches[0].clientY - lastY

  lightSphereRotateY.value -= deltaX * 0.5
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
watch(() => props.brightness, updateLightBrightness)
watch(() => props.colorTemp, updateLightColorTemp)

// ============ 生命周期 ============
onMounted(() => {
  initThree()
  if (container.value) {
    container.value.addEventListener('mousedown', handleMouseDown)
    container.value.addEventListener('touchstart', handleTouchStart, { passive: false })
  }
  updatePhotoTexture()
  updateLightTransform()
  updateLightBrightness()
  updateLightColorTemp()
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
  border-radius: 8px;
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