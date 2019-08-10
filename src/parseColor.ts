const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

export default (colorName: string) => {
  if (context === null) throw new Error("Unable to object 2D context");

  Object.assign(canvas, { width: 1, height: 1 });

  context.fillStyle = colorName;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;

  return { r, g, b, a };
};
