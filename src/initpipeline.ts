import potionsVertex from './shaders/positions.vert.wgsl?raw'
import colorFragment from './shaders/color.frag.wgsl?raw'
import { vertex, vertexCount } from './utils/cube'

async function initpipeline(device: GPUDevice, format: GPUTextureFormat) {
  const descriptor: GPURenderPipelineDescriptor = {
    vertex: {
      module: device.createShaderModule({
        code: potionsVertex,
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: 3 * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x3',
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: colorFragment,
      }),
      entryPoint: 'main',
      targets: [
        {
          format,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  }

  const pipeline = await device.createRenderPipelineAsync(descriptor)

  // Create a vertex shader module
  const vertexBuffer = device.createBuffer({
    size: vertex.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(vertexBuffer, 0, vertex)

  const vertexObj = {
    vertex,
    vertexBuffer,
    vertexCount,
  }

  // Create a bind group layout
  const color = new Float32Array([
    1.0, 1.0, 0, 1.0,
  ])
  const colorBuffer = device.createBuffer({
    size: color.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(colorBuffer, 0, color)

  const mvpMatrixBuffer = device.createBuffer({
    size: 16 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: colorBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: mvpMatrixBuffer,
        },
      },
    ],
  })

  const colorObj = {
    color,
    colorBuffer,
    group,
  }

  return { pipeline, vertexObj, colorObj, mvpMatrixBuffer }
}

export {
  initpipeline,
}
