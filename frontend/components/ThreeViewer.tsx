'use client'

import { useEffect, useRef } from 'react'
import { Project } from '@/types/projects'

interface Props { project: Project }

export default function ThreeViewer({ project }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animId: number
    let renderer: import('three').WebGLRenderer
    let controls: import('three/examples/jsm/controls/OrbitControls.js').OrbitControls
    let ro: ResizeObserver

    async function init() {
      if (!container) return
      const THREE = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

      const w = container.clientWidth || 600
      const h = container.clientHeight || 400

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x080e1c)
      scene.fog = new THREE.FogExp2(0x080e1c, 0.010)

      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 600)
      camera.position.set(40, 30, 48)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1
      container.appendChild(renderer.domElement)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.07
      controls.target.set(0, 10, 0)
      controls.minDistance = 18
      controls.maxDistance = 120
      controls.maxPolarAngle = Math.PI / 2.05
      camera.lookAt(controls.target)

      const ambient = new THREE.AmbientLight(0x304060, 0.8)
      scene.add(ambient)

      const sun = new THREE.DirectionalLight(0xfff0d8, 2.2)
      sun.position.set(25, 50, 18)
      sun.castShadow = true
      sun.shadow.camera.near = 0.5
      sun.shadow.camera.far = 250
      sun.shadow.camera.left = -60
      sun.shadow.camera.right = 60
      sun.shadow.camera.top = 60
      sun.shadow.camera.bottom = -60
      sun.shadow.mapSize.setScalar(2048)
      sun.shadow.bias = -0.0008
      scene.add(sun)

      const fill = new THREE.DirectionalLight(0x1030a0, 0.35)
      fill.position.set(-30, 12, -25)
      scene.add(fill)

      const groundGeo = new THREE.PlaneGeometry(140, 140)
      const groundMat = new THREE.MeshLambertMaterial({ color: 0x0c1520 })
      const ground = new THREE.Mesh(groundGeo, groundMat)
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = true
      scene.add(ground)

      const grid = new THREE.GridHelper(140, 28, 0x152030, 0x0f1a28)
      grid.position.y = 0.015
      scene.add(grid)

      const mainMat   = new THREE.MeshLambertMaterial({ color: 0xcdd8ea })
      const wingMat   = new THREE.MeshLambertMaterial({ color: 0xb8c8dc })
      const podiumMat = new THREE.MeshLambertMaterial({ color: 0xa5b8cc })
      const lineMat   = new THREE.LineBasicMaterial({ color: 0x4a74b0, transparent: true, opacity: 0.7 })

      const addBox = (geo: import('three').BoxGeometry, mat: import('three').MeshLambertMaterial, x: number, y: number, z: number) => {
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(x, y, z)
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)
        const edges = new THREE.EdgesGeometry(geo)
        mesh.add(new THREE.LineSegments(edges, lineMat))
        return mesh
      }

      const floors = project.floors ?? 8
      const bra    = project.bra_m2 ?? 5000
      const mainH  = floors * 3.2
      const footprint = Math.sqrt((bra / floors) * 1.25)
      const fw = Math.min(Math.max(footprint * 0.75, 10), 20)
      const fd = Math.min(Math.max(footprint * 0.55, 8), 15)

      addBox(new THREE.BoxGeometry(fw, mainH, fd), mainMat, 0, mainH / 2, 0)
      const wingH = Math.max(mainH * 0.58, 9)
      const wingW = fw * 0.7
      addBox(new THREE.BoxGeometry(wingW, wingH, fd * 1.45), wingMat, -(fw * 0.85 + wingW * 0.5), wingH / 2, fd * 0.22)
      const podH = Math.max(mainH * 0.18, 5)
      addBox(new THREE.BoxGeometry(fw * 0.55, podH, fd * 0.85), podiumMat, -(fw * 0.43), podH / 2, 0)
      const accentH = Math.max(mainH * 0.35, 6)
      addBox(new THREE.BoxGeometry(fw * 0.45, accentH, fd * 0.9), wingMat, fw * 0.85, accentH / 2, -fd * 0.15)
      const roofH = mainH * 0.08
      addBox(new THREE.BoxGeometry(fw * 0.6, roofH, fd * 0.6), podiumMat, 0, mainH + roofH / 2, 0)

      const animate = () => {
        animId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      ro = new ResizeObserver(() => {
        if (!container) return
        const nw = container.clientWidth
        const nh = container.clientHeight
        if (nw === 0 || nh === 0) return
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
        renderer.setSize(nw, nh)
      })
      ro.observe(container as Element)
    }

    init()

    return () => {
      cancelAnimationFrame(animId)
      if (ro) ro.disconnect()
      if (controls) controls.dispose()
      if (renderer) {
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
    }
  }, [project.id])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-800">
        <span>Prinsippmodell — ikke målfast</span>
      </div>
      <div className="absolute top-3 right-3 text-[10px] text-gray-600 bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-800">
        Dra for å rotere · Scroll for zoom
      </div>
    </div>
  )
}
