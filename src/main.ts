import { mat4, vec3 } from 'gl-matrix'
import { initwebGPU } from './initwebGPU'
import { initpipeline } from './initpipeline'

interface VertexObj {
  vertex: Float32Array
  vertexBuffer: GPUBuffer
  vertexCount: number
}

interface ColorObj {
  color: Float32Array
  colorBuffer: GPUBuffer
  group: GPUBindGroup
}

function draw(
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  context: GPUCanvasContext,
  vertexObj: VertexObj,
  colorObj: ColorObj,
) {
  const encoder = device.createCommandEncoder()
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
      clearValue: { r: 1, g: 1, b: 1, a: 1 },
    }],
  })

  renderPass.setPipeline(pipeline)
  renderPass.setVertexBuffer(0, vertexObj.vertexBuffer)
  renderPass.setBindGroup(0, colorObj.group)
  renderPass.draw(vertexObj.vertexCount)
  renderPass.end()
  const vertexBuffer = encoder.finish()
  device.queue.submit([vertexBuffer])
}

async function run() {
  const { device, format, context, size } = await initwebGPU()
  const { pipeline, vertexObj, colorObj, mvpMatrixBuffer } = await initpipeline(device, format)

  const position = { x: 0, y: 0, z: -8 }
  const rotation = { x: 0.5, y: 1, z: 0 }
  const scale = { x: 1, y: 1, z: 1 }

  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, vec3.fromValues(position.x, position.y, position.z))

  mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation.x)
  mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation.y)
  mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation.z)

  mat4.scale(modelViewMatrix, modelViewMatrix, vec3.fromValues(scale.x, scale.y, scale.z))

  const projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix, Math.PI / 4, size[0] / size[1], 0.1, 10)

  const mvpMatrix = mat4.create()
  mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix)
  device.queue.writeBuffer(mvpMatrixBuffer, 0, mvpMatrix as Float32Array)
  draw(device, pipeline, context, vertexObj, colorObj)

  document.querySelector('input[type="color"]')?.addEventListener('input', (e: Event) => {
    // get hex color string
    const color = (e.target as HTMLInputElement).value
    // parse hex color into rgb
    const r = +(`0x${color.slice(1, 3)}`) / 255
    const g = +(`0x${color.slice(3, 5)}`) / 255
    const b = +(`0x${color.slice(5, 7)}`) / 255

    colorObj.color[0] = r
    colorObj.color[1] = g
    colorObj.color[2] = b
    // write colorBuffer with new color

    device.queue.writeBuffer(colorObj.colorBuffer, 0, colorObj.color)
    draw(device, pipeline, context, vertexObj, colorObj)
  })
}

run()
