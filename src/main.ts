import { initwebGPU } from './initwebGPU'
import { initpipeline } from './initpipeline'

function draw(
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  context: GPUCanvasContext,
  vertexObj: any,
  colorObj: any,
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
  const { device, format, context } = await initwebGPU()
  const { pipeline, vertexObj, colorObj } = await initpipeline(device, format)
  draw(device, pipeline, context, vertexObj, colorObj)
}

run()
