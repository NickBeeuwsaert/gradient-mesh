function colorParser() {
  const cache = new Map();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new Error("Unable to obtain canvas context");
  }

  return (colorName: string) => {
    if (!cache.has(colorName)) {
      canvas.width = canvas.height = 1;
      context.fillStyle = colorName;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      cache.set(colorName, { r, g, b, a });
    }
    return cache.get(colorName);
  };
}

export default colorParser();
