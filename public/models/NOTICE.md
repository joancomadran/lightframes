# Third-party models

## isnet-general-use-int8.onnx

Background removal (subject segmentation).

- Model: IS-Net "general use" from [DIS — Highly Accurate Dichotomous Image Segmentation](https://github.com/xuebinqin/DIS)
  by Xuebin Qin et al., licensed under the Apache License 2.0.
- Source file: `isnet-general-use.onnx` from the [rembg](https://github.com/danielgatis/rembg) model releases
  (SHA-256 of the original not tracked here).
- **Modified by Lightframes:** weights dynamically quantized to 8-bit integers with ONNX Runtime
  (`quantize_dynamic`, `QUInt8`, per channel) to shrink it from 179 MB to 45 MB for in-browser use.
- SHA-256 of this file: `1143d3d61145ed4cf5c6651bc1388af49bdd9d0f4db3b7d7dbe07170efeaecac`

Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0

## MI-GAN (downloaded at runtime, not stored here)

Object removal (inpainting), [MI-GAN](https://github.com/Picsart-AI-Research/MI-GAN) by Picsart AI Research,
MIT License (code and weights). Fetched from Hugging Face at a pinned revision and checked against its SHA-256.
