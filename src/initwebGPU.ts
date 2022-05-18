async function initwebGPU() {
  // Create a WebGPU instance
  if (!navigator.gpu)
    throw new Error('WebGPU not supported')
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter)
    throw new Error('WebGPU not supported')
  const device = await adapter?.requestDevice()

  // Create a canvas context
  const canvas = document.querySelector('canvas')
  if (!canvas)
    throw new Error('No canvas found')
  const context = canvas.getContext('webgpu')
  if (!context)
    throw new Error('WebGPU not supported')

  const format = context.getPreferredFormat(adapter)
  const size = [canvas.clientHeight * window.devicePixelRatio, canvas.height * window.devicePixelRatio]

  context.configure({
    device,
    format,
    size,
    compositingAlphaMode: 'opaque',
  })

  return { adapter, device, context, format, size }
}

export {
  initwebGPU,
}
