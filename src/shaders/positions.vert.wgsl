@group(0) @binding(1) var<uniform> mvp : mat4x4<f32>;

@stage(vertex)
fn main(@location(0) position: vec4<f32>) -> @builtin(position) vec4<f32> {
  return mvp * position;
}
