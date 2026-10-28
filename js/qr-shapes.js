export function createQrShapes({ patternField }) {
  const pathCache = new Map();
  const ringShapePath = "M0.5 0A0.5 0.5 0 1 1 0.5 1A0.5 0.5 0 1 1 0.5 0Z M0.5 0.18A0.32 0.32 0 1 0 0.5 0.82A0.32 0.32 0 1 0 0.5 0.18Z M0.5 0.4A0.1 0.1 0 1 1 0.5 0.6A0.1 0.1 0 1 1 0.5 0.4Z";
  function polygonPath(points) {
    return points.map(([x, y], index) => `${index ? "L" : "M"}${x} ${y}`).join("") + "Z";
  }

  function radialPolygonPath(points, outerRadius, innerRadius, rotation = -Math.PI / 2) {
    const vertices = [];
    for (let point = 0; point < points * 2; point += 1) {
      const radius = point % 2 ? innerRadius : outerRadius;
      const angle = rotation + point * Math.PI / points;
      vertices.push([0.5 + Math.cos(angle) * radius, 0.5 + Math.sin(angle) * radius]);
    }
    return polygonPath(vertices);
  }

  function concentricRingPath(rings) {
    return rings.map((radius) =>
      `M0.5 ${0.5 - radius}A${radius} ${radius} 0 1 1 0.5 ${0.5 + radius}A${radius} ${radius} 0 1 1 0.5 ${0.5 - radius}Z`
    ).join("");
  }

  function squareRingPath(insets) {
    return insets.map((inset) => {
      const start = inset;
      const end = 1 - inset;
      return `M${start} ${start}H${end}V${end}H${start}Z`;
    }).join("");
  }

  function shapePath(shape) {
    if (shape.includes("thin square")) return squareRingPath([0, 0.09, 0.18, 0.27]);
    if (shape.includes("thick square")) return squareRingPath([0, 0.24, 0.36]);
    if (shape.includes("double square") || shape.includes("nested square") ||
        shape.includes("outline square") || shape.includes("open square")) {
      return squareRingPath([0, 0.13, 0.25, 0.38, 0.46]);
    }
    if (shape.includes("triple ring") || shape.includes("triple circle")) return concentricRingPath([0.5, 0.39, 0.28, 0.17, 0.07]);
    if (shape.includes("double ring") || shape.includes("double circle") ||
        shape.includes("concentric circle")) return concentricRingPath([0.5, 0.34, 0.18, 0.07]);
    if (shape.includes("ring") || shape.includes("donut") || shape.includes("target") ||
        shape.includes("hollow circle")) return ringShapePath;
    if (shape.includes("small circle")) return "M0.5 0.17A0.33 0.33 0 1 1 0.5 0.83A0.33 0.33 0 1 1 0.5 0.17Z";
    if (shape.includes("four point star")) return radialPolygonPath(4, 0.5, 0.15);
    if (shape.includes("six petal")) return radialPolygonPath(6, 0.5, 0.34);
    if (shape.includes("four petal")) return radialPolygonPath(4, 0.5, 0.32);
    if (shape.includes("spiral")) {
      return "M0.5 0.05C0.75 0.05 0.95 0.25 0.95 0.5C0.95 0.75 0.75 0.95 0.5 0.95C0.25 0.95 0.05 0.75 0.05 0.5C0.05 0.25 0.25 0.05 0.5 0.05C0.68 0.05 0.82 0.2 0.82 0.5C0.82 0.68 0.68 0.82 0.5 0.82C0.32 0.82 0.18 0.68 0.18 0.5C0.18 0.32 0.32 0.18 0.5 0.18C0.62 0.18 0.72 0.28 0.72 0.5C0.72 0.62 0.62 0.72 0.5 0.72C0.38 0.72 0.28 0.62 0.28 0.5C0.28 0.38 0.38 0.28 0.5 0.28C0.56 0.28 0.62 0.34 0.62 0.5C0.62 0.56 0.56 0.62 0.5 0.62C0.44 0.62 0.38 0.56 0.38 0.5C0.38 0.44 0.44 0.38 0.5 0.38Z";
    }
    if (shape.includes("pinwheel")) {
      return "M0.5 0.5L0.52 0.04Q0.76 0.16 0.62 0.38L0.96 0.5Q0.84 0.76 0.62 0.62L0.5 0.96Q0.24 0.84 0.38 0.62L0.04 0.5Q0.16 0.24 0.38 0.38Z";
    }
    if (shape.includes("gear")) return radialPolygonPath(12, 0.5, 0.39);
    if (shape.includes("mini grid")) {
      return Array.from({ length: 9 }, (_, index) => {
        const x = 0.08 + (index % 3) * 0.31;
        const y = 0.08 + Math.floor(index / 3) * 0.31;
        return `M${x} ${y}H${x + 0.23}V${y + 0.23}H${x}Z`;
      }).join("");
    }
    if (shape.includes("pixel")) {
      return "M0.08 0.08H0.4V0.4H0.08ZM0.6 0.08H0.92V0.4H0.6ZM0.08 0.6H0.4V0.92H0.08ZM0.6 0.6H0.92V0.92H0.6Z";
    }
    if (shape.includes("rounded diamond")) return "M0.5 0.02Q0.57 0.02 0.62 0.08L0.92 0.38Q0.98 0.43 0.98 0.5Q0.98 0.57 0.92 0.62L0.62 0.92Q0.57 0.98 0.5 0.98Q0.43 0.98 0.38 0.92L0.08 0.62Q0.02 0.57 0.02 0.5Q0.02 0.43 0.08 0.38L0.38 0.08Q0.43 0.02 0.5 0.02Z";
    if (shape.includes("shield")) return "M0.5 0L0.94 0.18L0.88 0.62Q0.78 0.86 0.5 1Q0.22 0.86 0.12 0.62L0.06 0.18Z";
    if (shape.includes("capsule")) return "M0.5 0A0.5 0.5 0 0 1 1 0.5A0.5 0.5 0 0 1 0 0.5A0.5 0.5 0 0 1 0.5 0Z";
    if (shape.includes("leaf")) return "M0.5 0Q0.82 0.1 1 0.5Q0.7 0.9 0.5 1Q0.18 0.72 0 0.5Q0.28 0.18 0.5 0Z";
    if (shape.includes("blob")) return "M0.5 0Q0.82 0.02 0.96 0.28Q1.08 0.58 0.78 0.84Q0.54 1.08 0.27 0.86Q-0.08 0.66 0.08 0.35Q0.18 0.08 0.5 0Z";
    if (shape.includes("organic")) return "M0.5 0Q0.9 0.1 0.92 0.45Q1 0.83 0.57 0.94Q0.18 1.03 0.08 0.62Q-0.02 0.22 0.5 0Z";
    if (shape.includes("fluid")) return "M0 0.22Q0.27 0.02 0.51 0.21T1 0.2V0.78Q0.7 0.98 0.48 0.79T0 0.8Z";
    if (shape.includes("circle dot")) return ringShapePath;
    if (shape.includes("circle") || shape.includes("dot") || shape.includes("sunburst")) {
      return "M0.5 0A0.5 0.5 0 1 1 0.5 1A0.5 0.5 0 1 1 0.5 0Z";
    }
    if (shape.includes("diamond")) return polygonPath([[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]]);
    if (shape.includes("hexagon") || shape.includes("honeycomb")) {
      return polygonPath([[0.25, 0], [0.75, 0], [1, 0.5], [0.75, 1], [0.25, 1], [0, 0.5]]);
    }
    if (shape.includes("octagon")) {
      return polygonPath([[0.3, 0], [0.7, 0], [1, 0.3], [1, 0.7], [0.7, 1], [0.3, 1], [0, 0.7], [0, 0.3]]);
    }
    if (shape.includes("triangle") || shape.includes("shield")) {
      return polygonPath(shape.includes("inverted")
        ? [[0, 0], [1, 0], [0.5, 1]]
        : [[0.5, 0], [1, 1], [0, 1]]);
    }
    if (shape.includes("star") || shape.includes("sunburst")) {
      const points = [];
      for (let point = 0; point < 10; point += 1) {
        const radius = point % 2 ? 0.36 : 0.5;
        const angle = -Math.PI / 2 + point * Math.PI / 5;
        points.push([0.5 + Math.cos(angle) * radius, 0.5 + Math.sin(angle) * radius]);
      }
      return polygonPath(points);
    }
    if (shape.includes("cross") || shape.includes("plus") || shape.includes("gear")) {
      return polygonPath([[0.36, 0], [0.64, 0], [0.64, 0.36], [1, 0.36], [1, 0.64],
        [0.64, 0.64], [0.64, 1], [0.36, 1], [0.36, 0.64], [0, 0.64], [0, 0.36], [0.36, 0.36]]);
    }
    if (shape.includes("vertical")) return "M0.2 0H0.8V1H0.2Z";
    if (shape.includes("horizontal")) return "M0 0.2H1V0.8H0Z";
    if (shape.includes("rounded bars")) return "M0.28 0.04Q0.28 0 0.36 0H0.64Q0.72 0 0.72 0.04V0.96Q0.72 1 0.64 1H0.36Q0.28 1 0.28 0.96Z";
    if (shape.includes("short line")) return "M0.18 0.38H0.82V0.62H0.18Z";
    if (shape.includes("thin line")) return "M0.08 0.44H0.92V0.56H0.08Z";
    if (shape.includes("dash")) return "M0.24 0.34H0.76V0.66H0.24Z";
    if (shape.includes("line")) return "M0.08 0.34H0.92V0.66H0.08Z";
    if (shape.includes("flower")) {
      return "M0.5 0Q0.68 0.3 1 0.5Q0.68 0.7 0.5 1Q0.32 0.7 0 0.5Q0.32 0.3 0.5 0Z";
    }
    if (shape.includes("petal")) return "M0.5 0Q0.72 0.18 0.66 0.5Q0.72 0.82 0.5 1Q0.28 0.82 0.34 0.5Q0.28 0.18 0.5 0Z";
    if (shape.includes("wave")) {
      return "M0 0.18Q0.25 0.06 0.5 0.18T1 0.18V0.82Q0.75 0.94 0.5 0.82T0 0.82Z";
    }
    if (shape.includes("extra rounded")) return "M0.36 0H0.64A0.36 0.36 0 0 1 1 0.36V0.64A0.36 0.36 0 0 1 0.64 1H0.36A0.36 0.36 0 0 1 0 0.64V0.36A0.36 0.36 0 0 1 0.36 0Z";
    if (shape.includes("fully rounded")) return "M0.5 0A0.5 0.5 0 1 1 0.5 1A0.5 0.5 0 1 1 0.5 0Z";
    if (shape.includes("rounded") || shape.includes("soft") || shape.includes("squircle") ||
        shape.includes("capsule") || shape.includes("flower") || shape.includes("artistic") ||
        shape.includes("decorative") || shape.includes("geometric") || shape.includes("futuristic") ||
        shape.includes("circuit") || shape.includes("minimal") || shape.includes("logo")) {
      return "M0.12 0H0.88Q1 0 1 0.12V0.88Q1 1 0.88 1H0.12Q0 1 0 0.88V0.12Q0 0 0.12 0Z";
    }
    return "M0 0H1V1H0Z";
  }

  function isCompoundPath(path) {
    return (path.match(/M/g) || []).length > 1;
  }

  function moduleStyle(row, column) {
    const pattern = patternField.value.toLowerCase();
    let shape = pattern;
    let scale = pattern.includes("square qr pattern") ? 0.92 : 1;
    if (pattern.includes("circuit")) shape = (row + column) % 2 ? "plus" : "rounded square";
    return { path: shapePath(shape), scale };
  }

  function eyeGlyph(name) {
    const lower = name.toLowerCase();
    return shapePath(lower.replace(" qr eye center", "").replace(" qr eye", ""));
  }

  function drawPath(context, path, x, y, size, fill) {
    let shape = pathCache.get(path);
    if (!shape) {
      shape = new Path2D(path);
      pathCache.set(path, shape);
    }
    context.save();
    context.translate(x, y);
    context.scale(size, size);
    if (fill) {
      context.fillStyle = fill;
      context.fill(shape, isCompoundPath(path) ? "evenodd" : "nonzero");
    }
    context.restore();
  }
  return { moduleStyle, eyeGlyph, shapePath, isCompoundPath, drawPath };
}
