<template>
  <div ref="container" class="three-scene-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// ============ Props ============
const props = defineProps({
  mode: { type: String, default: 'subject' },  // 模式：subject 或 camera
  imageUrl: String,                             // 图片URL
  cubeRotateX: { type: Number, default: 0 },   // 立方体X轴旋转
  cubeRotateY: { type: Number, default: 0 },   // 立方体Y轴旋转
  cubeScale: { type: Number, default: 1.6 },   // 立方体缩放
  sphereRotateX: { type: Number, default: 0 }, // 球体X轴旋转
  sphereRotateY: { type: Number, default: 0 }, // 球体Y轴旋转
  cameraSphereRotateX: { type: Number, default: 0 }, // 摄像头球体X轴旋转
  cameraSphereRotateY: { type: Number, default: 0 },  // 摄像头球体Y轴旋转
  cameraTextureScale: { type: Number, default: 1.0 }, // 摄像头屏幕纹理缩放
  cameraTextureOffset: { type: Number, default: 0.0 }, // 摄像头屏幕纹理偏移
  cubeTextureScale: { type: Number, default: 1.0 }, // 立方体纹理缩放
  cubeTextureOffset: { type: Number, default: 0.0 }  // 立方体纹理偏移
})

const emit = defineEmits(['drag', 'dragEnd'])

// ============ 响应式引用 ============
const container = ref(null)

// ============ Three.js 对象 ============
let scene, camera, renderer
let cubeGroup, sphereGroup, cameraGroup
let frontCameraScreenMesh, backCameraScreenMesh
let connectionLine  // 摄像机到中心的连接线

// ============ 拖动状态 ============
let isDragging = false
let lastX = 0, lastY = 0

// ============ 纹理缓存 ============
const textureCache = new Map()

// ============ 初始化 Three.js ============
const initThree = () => {
  // 创建场景
  scene = new THREE.Scene()
  // 移除背景颜色，使场景透明，通过 CSS 控制背景

  // 创建相机
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
  camera.position.z = 5

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(236, 236)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.autoClear = false  // 不自动清除，确保多层渲染正确
  renderer.sortObjects = true  // 启用对象排序
  container.value.appendChild(renderer.domElement)

  // 添加光照
  setupLighting()

  // 创建3D对象
  createCube()
  createSphereGrid()
  createCameraModel()

  // 更新初始变换
  updateCubeTransform()

  // 开始动画循环
  animate()
}

// ============ 设置光照 ============
const setupLighting = () => {
  // 环境光 - 降低强度，使阴影更明显
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // 主方向光 - 从右上前方照射
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(3, 5, 3)
  scene.add(directionalLight)

  // 顶部补光 - 增强顶部亮度
  const topLight = new THREE.DirectionalLight(0xffffff, 0.8)
  topLight.position.set(0, 5, 0)
  scene.add(topLight)

  // 背面补光 - 降低强度，增强对比
  const backLight = new THREE.DirectionalLight(0xffffff, 0.4)
  backLight.position.set(-3, -2, -5)
  scene.add(backLight)
}

// ============ 创建文字纹理 ============
const createTextTexture = (text) => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  // 设置背景色
  ctx.fillStyle = 'rgba(50, 50, 50, 1)'
  ctx.fillRect(0, 0, 256, 256)

  // 绘制文字
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'
  ctx.font = 'bold 130px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 128)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// ============ 创建立方体 ============
const createCube = () => {
  cubeGroup = new THREE.Group()

  // 6个圆角正方形面组成完整立方体
  const faceSize = 0.8  // 每个面的尺寸
  const cornerRadius = 0.15  // 圆角半径
  const thickness = 0.02  // 面的厚度
  const halfSize = faceSize / 2
  const curveSegments = 12  // 圆角分段数，值越大圆角越平滑

  // 创建圆角矩形 Shape
  const createRoundedRectShape = (width, height, radius, curveSegments) => {
    const shape = new THREE.Shape()
    const halfWidth = width / 2
    const halfHeight = height / 2

    // 从左下角开始，逆时针绘制
    shape.moveTo(-halfWidth + radius, -halfHeight)
    shape.lineTo(halfWidth - radius, -halfHeight)
    shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius) // 右下角
    shape.lineTo(halfWidth, halfHeight - radius)
    shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight) // 右上角
    shape.lineTo(-halfWidth + radius, halfHeight)
    shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius) // 左上角
    shape.lineTo(-halfWidth, -halfHeight + radius)
    shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight) // 左下角

    return shape
  }

  // 创建圆角矩形几何体
  const shape = createRoundedRectShape(faceSize, faceSize, cornerRadius, curveSegments)
  const extrudeSettings = {
    steps: 1,
    depth: thickness,
    bevelEnabled: false
  }
  const faceGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  // 调整几何体中心，使其围绕原点
  faceGeometry.center()

  // 修复纹理坐标，使纹理正确显示在正面和背面
  const uvAttribute = faceGeometry.attributes.uv
  const positionAttribute = faceGeometry.attributes.position

  for (let i = 0; i < positionAttribute.count; i++) {
    const z = positionAttribute.getZ(i)
    // 正面（z > 0）
    if (z > 0) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)
      // 将 x, y 映射到 [0, 1] 范围
      uvAttribute.setXY(i, (x / faceSize) + 0.5, (y / faceSize) + 0.5)
    }
    // 背面（z < 0）
    else if (z < 0) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)
      // 背面翻转 x 坐标
      uvAttribute.setXY(i, 0.5 - (x / faceSize), (y / faceSize) + 0.5)
    }
  }
  uvAttribute.needsUpdate = true

  // 创建边框几何体（使用边缘几何体）
  const edgesGeometry = new THREE.EdgesGeometry(faceGeometry)
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,  // 亮白色
    linewidth: 0.01,
    transparent: true,
    opacity: 0.01
  })

  // 面标签映射
  const faceLabels = {
    front: 'F',  // 前面
    back: 'K',   // 后面
    top: 'T',    // 上面
    bottom: 'B', // 下面
    right: 'R',  // 右面
    left: 'L'    // 左面
  }

  // 前面（Z轴正方向）- 用于贴图
  const frontFace = new THREE.Mesh(faceGeometry, new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  }))
  frontFace.position.set(0, 0, halfSize)
  frontFace.userData = { label: faceLabels.front }
  cubeGroup.add(frontFace)

  // 前面边框
  const frontEdgesMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 0.1,
    transparent: true,
    opacity: 0.3
  })
  const frontEdges = new THREE.LineSegments(edgesGeometry, frontEdgesMaterial)
  frontEdges.position.set(0, 0, halfSize)
  cubeGroup.add(frontEdges)

  // 后面（Z轴负方向）
  const backTexture = createTextTexture(faceLabels.back)
  const backFace = new THREE.Mesh(faceGeometry, new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x666666,
    shininess: 60,
    side: THREE.DoubleSide,
    map: backTexture,
    transparent: true,
    opacity: 0.8
  }))
  backFace.position.set(0, 0, -halfSize)
  backFace.rotation.y = Math.PI
  backFace.userData = { label: faceLabels.back }
  cubeGroup.add(backFace)

  // 后面边框
  const backEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  backEdges.position.set(0, 0, -halfSize)
  backEdges.rotation.y = Math.PI
  cubeGroup.add(backEdges)

  // 上面（Y轴正方向）
  const topTexture = createTextTexture(faceLabels.top)
  const topFace = new THREE.Mesh(faceGeometry, new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x666666,
    shininess: 60,
    side: THREE.DoubleSide,
    map: topTexture,
    transparent: true,
    opacity: 0.8
  }))
  topFace.position.set(0, halfSize, 0)
  topFace.rotation.x = -Math.PI / 2
  topFace.userData = { label: faceLabels.top }
  cubeGroup.add(topFace)

  // 上面边框
  const topEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  topEdges.position.set(0, halfSize, 0)
  topEdges.rotation.x = -Math.PI / 2
  cubeGroup.add(topEdges)

  // 下面（Y轴负方向）
  const bottomTexture = createTextTexture(faceLabels.bottom)
  const bottomFace = new THREE.Mesh(faceGeometry, new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x666666,
    shininess: 60,
    side: THREE.DoubleSide,
    map: bottomTexture,
    transparent: true,
    opacity: 0.8
  }))
  bottomFace.position.set(0, -halfSize, 0)
  bottomFace.rotation.x = Math.PI / 2
  bottomFace.userData = { label: faceLabels.bottom }
  cubeGroup.add(bottomFace)

  // 下面边框
  const bottomEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  bottomEdges.position.set(0, -halfSize, 0)
  bottomEdges.rotation.x = Math.PI / 2
  cubeGroup.add(bottomEdges)

  // 右面（X轴正方向）
  const rightTexture = createTextTexture(faceLabels.right)
  const rightFace = new THREE.Mesh(faceGeometry, new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x666666,
    shininess: 60,
    side: THREE.DoubleSide,
    map: rightTexture,
    transparent: true,
    opacity: 0.8
  }))
  rightFace.position.set(halfSize, 0, 0)
  rightFace.rotation.y = Math.PI / 2
  rightFace.userData = { label: faceLabels.right }
  cubeGroup.add(rightFace)

  // 右面边框
  const rightEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  rightEdges.position.set(halfSize, 0, 0)
  rightEdges.rotation.y = Math.PI / 2
  cubeGroup.add(rightEdges)

  // 左面（X轴负方向）
  const leftTexture = createTextTexture(faceLabels.left)
  const leftFace = new THREE.Mesh(faceGeometry, new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x666666,
    shininess: 60,
    side: THREE.DoubleSide,
    map: leftTexture,
    transparent: true,
    opacity: 1
  }))
  leftFace.position.set(-halfSize, 0, 0)
  leftFace.rotation.y = -Math.PI / 2
  leftFace.userData = { label: faceLabels.left }
  cubeGroup.add(leftFace)

  // 左面边框
  const leftEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  leftEdges.position.set(-halfSize, 0, 0)
  leftEdges.rotation.y = -Math.PI / 2
  cubeGroup.add(leftEdges)

  cubeGroup.renderOrder = 0  // 设置较低的渲染顺序
  scene.add(cubeGroup)
}

// ============ 创建球体网格 ============
const createSphereGrid = () => {
  sphereGroup = new THREE.Group()
  const radius = 1.3

  // 创建4个主要顶点
  const vertices = [
    new THREE.Vector3(0, radius, 0),         // 上 (0)
    new THREE.Vector3(0, -radius, 0),        // 下 (1)
    new THREE.Vector3(radius, 0, 0),         // 右 (2)
    new THREE.Vector3(-radius, 0, 0)         // 左 (3)
  ]

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
  for (let lon = -90; lon <= 90; lon += 9) {
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

  // 定义连接关系（每个顶点都与其他三个相连）
  const connections = [
    [0, 1], [0, 2], [0, 3],  // 上连接下、右、左
    [1, 2], [1, 3],           // 下连接右、左
    [2, 3]                    // 右连接左
  ]

  // 辅助函数：在球面上创建圆弧
  const createSphereArc = (v1, v2, segments = 30) => {
    const points = []

    // 归一化到球面
    const p1 = v1.clone().normalize().multiplyScalar(radius)
    const p2 = v2.clone().normalize().multiplyScalar(radius)

    // 使用球面插值
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      // 球面线性插值（SLERP）
      const dot = p1.dot(p2)
      const theta = Math.acos(Math.max(-1, Math.min(1, dot)))
      const sinTheta = Math.sin(theta)

      let point
      if (sinTheta < 0.001) {
        point = p1.clone().lerp(p2, t)
      } else {
        const w1 = Math.sin((1 - t) * theta) / sinTheta
        const w2 = Math.sin(t * theta) / sinTheta
        point = p1.clone().multiplyScalar(w1).add(p2.clone().multiplyScalar(w2))
      }

      point.normalize().multiplyScalar(radius)
      points.push(point)
    }

    return points
  }

  // 创建连接线（球面弧线）
  connections.forEach(([from, to]) => {
    const points = createSphereArc(vertices[from], vertices[to])
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0x888888,  // 与经纬线相同的灰色
      transparent: true,
      opacity: 0.04
    })
    const line = new THREE.Line(geometry, material)
    sphereGroup.add(line)
  })

  // 创建4个顶点（小球体）
  const pointGeometry = new THREE.SphereGeometry(0.03, 16, 16)  // 更大的尺寸
  const pointMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,  // 白色发光
    transparent: false,
    opacity: 1.0  // 完全不透明
  })

  vertices.forEach((vertex) => {
    const point = new THREE.Mesh(pointGeometry, pointMaterial)
    point.position.copy(vertex)
    sphereGroup.add(point)
  })

  sphereGroup.visible = false
  scene.add(sphereGroup)
}

// ============ 创建摄像机模型 ============
const createCameraModel = () => {
  cameraGroup = new THREE.Group()

  // 摄像机主体（使用 RoundedBoxGeometry 实现圆角效果）
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,  // 白色底色
    specular: 0x777777,  // 高光颜色
    shininess: 80,  // 光泽度
    side: THREE.DoubleSide
  })

  const width = 0.4
  const height = 0.28
  const depth = 0.15  // 缩小前后距离
  const cornerRadius = 0.2  // 圆角半径
  const cornerSegments = 2  // 圆角分段数

  // 创建圆角立方体
  const bodyGeometry = new RoundedBoxGeometry(width, height, depth, cornerSegments, cornerRadius)
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  cameraGroup.add(body)

  // 前面屏幕（面对球体中心）
  const frontScreenGeometry = new THREE.PlaneGeometry(0.24, 0.17)
  const frontScreenMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,  // 白色底色
    specular: 0x666666,
    shininess: 50,
    side: THREE.DoubleSide
  })
  frontCameraScreenMesh = new THREE.Mesh(frontScreenGeometry, frontScreenMaterial)
  frontCameraScreenMesh.position.z = -0.08
  frontCameraScreenMesh.renderOrder = 1100  // 设置更高的渲染顺序，确保在连接线之前渲染
  cameraGroup.add(frontCameraScreenMesh)

  // 顶部按钮
  const buttonGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.008, 32)
  const buttonMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,  // 白色底色
    specular: 0x999999,
    shininess: 100
  })
  const button = new THREE.Mesh(buttonGeometry, buttonMaterial)
  button.position.x = -0.14
  button.position.y = 0.14
  cameraGroup.add(button)

  // 后面屏幕（朝向观察者）
  const backScreenGeometry = new THREE.PlaneGeometry(0.3, 0.2)
  const backScreenMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,  // 白色底色
    specular: 0x666666,
    shininess: 50,
    side: THREE.DoubleSide
  })
  backCameraScreenMesh = new THREE.Mesh(backScreenGeometry, backScreenMaterial)
  backCameraScreenMesh.position.z = 0.08
  backCameraScreenMesh.renderOrder = 1100  // 设置更高的渲染顺序，确保在连接线之前渲染
  cameraGroup.add(backCameraScreenMesh)

  cameraGroup.position.z = 1.2
  cameraGroup.lookAt(0, 0, 0)
  cameraGroup.visible = false
  scene.add(cameraGroup)

  // 创建摄像机到中心的连接线
  createConnectionLine()
}

// ============ 创建连接线 ============
const createConnectionLine = () => {
  // 创建一条有厚度的线条（使用圆柱体）
  const length = 1.2
  const radius = 0.005  // 更大的线条粗细

  const geometry = new THREE.CylinderGeometry(radius, radius, length, 8)
  const material = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa,  // 浅灰色
    depthTest: false,  // 不进行深度测试
    depthWrite: false, // 不写入深度缓冲区
    transparent: false
  })

  connectionLine = new THREE.Mesh(geometry, material)
  connectionLine.position.z = length / 2  // 将一端放在原点
  connectionLine.visible = false  // 默认隐藏，只在摄像头模式显示
  connectionLine.renderOrder = 1000  // 最高的渲染顺序
  scene.add(connectionLine)

  console.log('连接线已创建', connectionLine)
}

// ============ 更新立方体变换 ============
const updateCubeTransform = () => {
  if (cubeGroup) {
    cubeGroup.rotation.x = THREE.MathUtils.degToRad(props.cubeRotateX)
    cubeGroup.rotation.y = THREE.MathUtils.degToRad(props.cubeRotateY)
    cubeGroup.scale.setScalar(props.cubeScale)
  }
}

// ============ 更新球体网格变换 ============
const updateSphereTransform = () => {
  if (sphereGroup) {
    sphereGroup.rotation.x = THREE.MathUtils.degToRad(props.sphereRotateX)
    sphereGroup.rotation.y = THREE.MathUtils.degToRad(props.sphereRotateY)
  }
}

// ============ 更新摄像机变换 ============
const updateCameraTransform = () => {
  if (cameraGroup) {
    const radius = 1.2
    const theta = THREE.MathUtils.degToRad(-props.cameraSphereRotateY)  // 水平旋转角度，使用负号翻转左右
    const phi = THREE.MathUtils.degToRad(-props.cameraSphereRotateX)  // 垂直倾斜角度，使用负号翻转上下

    // 使用球坐标计算摄像机位置
    // theta=0, phi=0 时：x=0, y=0, z=1.2（正前方）
    cameraGroup.position.x = radius * Math.cos(phi) * Math.sin(theta)
    cameraGroup.position.y = radius * Math.sin(phi)
    cameraGroup.position.z = radius * Math.cos(phi) * Math.cos(theta)
    cameraGroup.lookAt(0, 0, 0)

    // 更新连接线位置
    updateConnectionLine()
  }
}

// ============ 更新连接线 ============
const updateConnectionLine = () => {
  if (connectionLine && cameraGroup) {
    // 连接线从原点指向摄像机
    const from = new THREE.Vector3(0, 0, 0)
    const to = new THREE.Vector3(cameraGroup.position.x, cameraGroup.position.y, cameraGroup.position.z)

    // 计算距离
    const length = from.distanceTo(to)

    // 计算中点位置
    const midPoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)

    // 将连接线放在中点
    connectionLine.position.copy(midPoint)

    // 计算从原点到摄像机的方向
    const direction = new THREE.Vector3().subVectors(to, from).normalize()

    // 创建一个四元数，让 Y 轴指向摄像机方向
    const up = new THREE.Vector3(0, 1, 0)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction)

    // 设置旋转
    connectionLine.setRotationFromQuaternion(quaternion)

    // 根据距离缩放连接线（缩放 Y 轴）
    connectionLine.scale.set(1, length / 1.2, 1)

    console.log('连接线已更新', {
      from: from,
      to: to,
      midPoint: midPoint,
      direction: direction,
      length: length,
      scale: length / 1.2,
      visible: connectionLine.visible
    })
  }
}

// ============ 加载纹理 ============
const loadTexture = (url, onLoad) => {
  const textureLoader = new THREE.TextureLoader()

  // 检查缓存
  if (textureCache.has(url)) {
    const texture = textureCache.get(url)
    onLoad(texture)
    return
  }

  // 加载新纹理
  textureLoader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      textureCache.set(url, texture)
      onLoad(texture)
    },
    undefined,
    (err) => console.error('纹理加载失败:', err)
  )
}

// ============ 更新立方体纹理 ============
const updateCubeTexture = () => {
  if (props.imageUrl && cubeGroup && cubeGroup.children.length > 0) {
    // 加载原始图片以获取尺寸
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // 创建一个正方形的 canvas
      const canvas = document.createElement('canvas')
      const size = 512  // 使用较大的尺寸以提高清晰度
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      // 以宽度为基准，宽度填满面
      const imgAspect = img.width / img.height
      const drawWidth = size
      const drawHeight = size / imgAspect  // 高度按原始比例计算
      const drawX = 0
      const drawY = (size - drawHeight) / 2  // 垂直居中

      // 绘制图片，宽度填满，高度不缩放
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

      // 创建纹理
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping

      // 将纹理应用到前面（第一个子元素）
      if (cubeGroup.children[0] && cubeGroup.children[0].material) {
        cubeGroup.children[0].material.map = texture
        cubeGroup.children[0].material.needsUpdate = true
      }
    }
    img.src = props.imageUrl
  }
}

// ============ 更新摄像机屏幕纹理 ============
const updateCameraScreenTexture = () => {
  if (!props.imageUrl) return

  loadTexture(props.imageUrl, (texture) => {
    // 应用纹理缩放和偏移
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.set(props.cameraTextureScale, props.cameraTextureScale)
    texture.offset.set(props.cameraTextureOffset, props.cameraTextureOffset)

    if (frontCameraScreenMesh) {
      frontCameraScreenMesh.material.map = texture
      frontCameraScreenMesh.material.needsUpdate = true
    }
    if (backCameraScreenMesh) {
      backCameraScreenMesh.material.map = texture
      backCameraScreenMesh.material.needsUpdate = true
    }
  })
}

// ============ 动画循环 ============
const animate = () => {
  requestAnimationFrame(animate)

  // 正常渲染
  renderer.render(scene, camera)

  // 如果连接线可见，再次渲染连接线（确保在最上层）
  if (connectionLine && connectionLine.visible) {
    renderer.clearDepth()  // 清除深度缓冲区
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
// 监听模式切换
watch(() => props.mode, (newMode) => {
  console.log('模式切换:', newMode)
  if (sphereGroup && cameraGroup) {
    if (newMode === 'camera') {
      sphereGroup.visible = true
      cameraGroup.visible = true
      connectionLine.visible = true  // 显示连接线
      console.log('连接线已设置为可见', connectionLine.visible)
      cubeGroup.position.set(0, 0, -1.8)
      cubeGroup.scale.setScalar(props.cubeScale)
      cubeGroup.rotation.set(0, 0, 0)
      updateCameraTransform()
      updateSphereTransform()
      updateCameraScreenTexture()  // 更新摄像机屏幕纹理
    } else {
      sphereGroup.visible = false
      cameraGroup.visible = false
      connectionLine.visible = false  // 隐藏连接线
      // 恢复默认位置和变换
      cubeGroup.position.set(0, 0, 0)
      updateCubeTransform()
    }
  }
})

// 监听立方体变换
watch(() => [props.cubeRotateX, props.cubeRotateY, props.cubeScale], () => {
  if (props.mode === 'subject') {
    updateCubeTransform()
  } else if (props.mode === 'camera') {
    cubeGroup.scale.setScalar(props.cubeScale)
  }
})

// 监听球体网格变换
watch(() => [props.sphereRotateX, props.sphereRotateY], updateSphereTransform)

// 监听摄像机变换
watch(() => [props.cameraSphereRotateX, props.cameraSphereRotateY], updateCameraTransform)

// 监听图片URL变化
watch(() => props.imageUrl, () => {
  updateCubeTexture()
  updateCameraScreenTexture()
})

// 监听摄像机纹理缩放和偏移变化
watch(() => [props.cameraTextureScale, props.cameraTextureOffset], () => {
  updateCameraScreenTexture()
})

// ============ 生命周期 ============
onMounted(() => {
  initThree()
  const canvas = renderer.domElement
  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('touchstart', handleTouchStart)
  updateCubeTexture()
  updateCameraScreenTexture()
  updateCameraTransform()
  updateSphereTransform()
  updateConnectionLine()  // 初始化连接线
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
.three-scene-container {
  width: 236px;
  height: 236px;
  cursor: grab;
  user-select: none;
  background-color: rgba(60, 60, 60, 0.3);
}

.three-scene-container:active {
  cursor: grabbing;
}
</style>
