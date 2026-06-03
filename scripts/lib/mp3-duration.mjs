const BITRATE_INDEXES = {
  V1L1: [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
  V1L2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
  V1L3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  V2L1: [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
  V2L2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  V2L3: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};

const SAMPLE_RATES = {
  V1: [44100, 48000, 32000],
  V2: [22050, 24000, 16000],
  V25: [11025, 12000, 8000],
};

function readSynchsafeInteger(buffer, offset) {
  return (
    ((buffer[offset] & 0x7f) << 21) |
    ((buffer[offset + 1] & 0x7f) << 14) |
    ((buffer[offset + 2] & 0x7f) << 7) |
    (buffer[offset + 3] & 0x7f)
  );
}

function skipId3Tag(buffer) {
  if (buffer.length < 10) return 0;
  if (buffer.toString("ascii", 0, 3) !== "ID3") return 0;

  const flags = buffer[5];
  const size = readSynchsafeInteger(buffer, 6);
  const footerSize = flags & 0x10 ? 10 : 0;

  return 10 + size + footerSize;
}

function getVersion(versionBits) {
  if (versionBits === 0b11) return "V1";
  if (versionBits === 0b10) return "V2";
  if (versionBits === 0b00) return "V25";
  return null;
}

function getLayer(layerBits) {
  if (layerBits === 0b11) return "L1";
  if (layerBits === 0b10) return "L2";
  if (layerBits === 0b01) return "L3";
  return null;
}

function getBitrate(version, layer, bitrateIndex) {
  if (bitrateIndex <= 0 || bitrateIndex >= 0b1111) return null;

  let key;

  if (version === "V1") {
    key = `${version}${layer}`;
  } else if (layer === "L1") {
    key = "V2L1";
  } else if (layer === "L2") {
    key = "V2L2";
  } else {
    key = "V2L3";
  }

  return BITRATE_INDEXES[key][bitrateIndex] * 1000;
}

function getSampleRate(version, sampleRateIndex) {
  if (sampleRateIndex >= 0b11) return null;
  return SAMPLE_RATES[version][sampleRateIndex];
}

function getSamplesPerFrame(version, layer) {
  if (layer === "L1") return 384;
  if (layer === "L2") return 1152;
  if (version === "V1") return 1152;
  return 576;
}

function getFrameLength(version, layer, bitrate, sampleRate, paddingBit) {
  if (layer === "L1") {
    return Math.floor(((12 * bitrate) / sampleRate + paddingBit) * 4);
  }

  if (layer === "L3" && version !== "V1") {
    return Math.floor((72 * bitrate) / sampleRate + paddingBit);
  }

  return Math.floor((144 * bitrate) / sampleRate + paddingBit);
}

function readFrameCountFromVbrHeader(buffer, frameStart, version, channelMode) {
  let sideInfoSize;

  if (version === "V1") {
    sideInfoSize = channelMode === 0b11 ? 17 : 32;
  } else {
    sideInfoSize = channelMode === 0b11 ? 9 : 17;
  }
  const xingOffset = frameStart + 4 + sideInfoSize;

  if (xingOffset + 16 <= buffer.length) {
    const marker = buffer.toString("ascii", xingOffset, xingOffset + 4);
    if (marker === "Xing" || marker === "Info") {
      const flags = buffer.readUInt32BE(xingOffset + 4);
      const hasFrames = (flags & 0x0001) !== 0;
      if (hasFrames) {
        return buffer.readUInt32BE(xingOffset + 8);
      }
    }
  }

  const vbriOffset = frameStart + 36;
  if (vbriOffset + 18 <= buffer.length) {
    const marker = buffer.toString("ascii", vbriOffset, vbriOffset + 4);
    if (marker === "VBRI") {
      return buffer.readUInt32BE(vbriOffset + 14);
    }
  }

  return null;
}

export function getMp3DurationMs(buffer) {
  let offset = skipId3Tag(buffer);
  let totalSamples = 0;
  let detectedSampleRate = null;

  while (offset + 4 <= buffer.length) {
    const header = buffer.readUInt32BE(offset);

    if ((header & 0xffe00000) !== 0xffe00000) {
      offset += 1;
      continue;
    }

    const versionBits = (header >> 19) & 0b11;
    const layerBits = (header >> 17) & 0b11;
    const bitrateIndex = (header >> 12) & 0b1111;
    const sampleRateIndex = (header >> 10) & 0b11;
    const paddingBit = (header >> 9) & 0b1;
    const channelMode = (header >> 6) & 0b11;

    const version = getVersion(versionBits);
    const layer = getLayer(layerBits);

    if (!version || !layer) {
      offset += 1;
      continue;
    }

    const bitrate = getBitrate(version, layer, bitrateIndex);
    const sampleRate = getSampleRate(version, sampleRateIndex);

    if (!bitrate || !sampleRate) {
      offset += 1;
      continue;
    }

    const samplesPerFrame = getSamplesPerFrame(version, layer);
    const frameLength = getFrameLength(version, layer, bitrate, sampleRate, paddingBit);

    if (!frameLength || offset + frameLength > buffer.length) {
      break;
    }

    if (totalSamples === 0) {
      const frameCount = readFrameCountFromVbrHeader(buffer, offset, version, channelMode);
      if (frameCount) {
        return Math.round((frameCount * samplesPerFrame * 1000) / sampleRate);
      }
    }

    detectedSampleRate ??= sampleRate;
    totalSamples += samplesPerFrame;
    offset += frameLength;
  }

  if (totalSamples === 0 || !detectedSampleRate) {
    throw new Error("Could not determine MP3 duration.");
  }

  const durationSeconds = totalSamples / detectedSampleRate;
  return Math.round(durationSeconds * 1000);
}
