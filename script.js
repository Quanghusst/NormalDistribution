function normalPDF(x, mu, sigma) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
         Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function normalCDF(x, mu, sigma) {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741,
        a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5*t + a4)*t + a3)*t + a2)*t + a1)*t)*Math.exp(-x*x);
  return sign * y;
}

function draw() {
  const svg = document.getElementById("chart");
  svg.innerHTML = "";

  const mu = parseFloat(document.getElementById("mean").value);
  const sigma = parseFloat(document.getElementById("std").value);
  const xval = parseFloat(document.getElementById("xval").value);
  const xAbs = Math.abs(xval);

  const w = svg.clientWidth;
  const h = svg.clientHeight;
  const padding = 50;

  const xMin = mu - 4 * sigma;
  const xMax = mu + 4 * sigma;
  const step = (xMax - xMin) / (w - 2 * padding);

  let maxPDF = 0;
  for (let x = xMin; x <= xMax; x += step) {
    const y = normalPDF(x, mu, sigma);
    if (y > maxPDF) maxPDF = y;
  }

  const xToSvg = x => padding + (x - xMin) / (xMax - xMin) * (w - 2 * padding);
  const yToSvg = y => h - padding - (y / maxPDF) * (h - 2 * padding);

  // === Vẽ vùng tô ===
  let shade = `M ${xToSvg(-xAbs)} ${yToSvg(0)} `;
  for (let x = -xAbs; x <= xAbs; x += step) {
    const y = normalPDF(x, mu, sigma);
    shade += `L ${xToSvg(x)} ${yToSvg(y)} `;
  }
  shade += `L ${xToSvg(xAbs)} ${yToSvg(0)} Z`;

  const area = createSVG("path", {
    d: shade,
    fill: "pink"
  });
  svg.appendChild(area);

  // === Vẽ đường cong ===
  let path = "";
  for (let x = xMin; x <= xMax; x += step) {
    const y = normalPDF(x, mu, sigma);
    const cx = xToSvg(x);
    const cy = yToSvg(y);
    path += (x === xMin ? "M" : "L") + cx + " " + cy + " ";
  }

  const curve = createSVG("path", {
    d: path,
    stroke: "blue",
    "stroke-width": 2,
    fill: "none"
  });
  svg.appendChild(curve);

  // === Trục X ===
  const xAxis = createSVG("line", {
    x1: padding, y1: h - padding,
    x2: w - padding, y2: h - padding,
    stroke: "black"
  });
  svg.appendChild(xAxis);

  // === Trục Y ===
  const yAxis = createSVG("line", {
    x1: padding, y1: padding,
    x2: padding, y2: h - padding,
    stroke: "black"
  });
  svg.appendChild(yAxis);

  // === Nhãn trục X ===
  const xTicks = 9;
  for (let i = 0; i <= xTicks; i++) {
    const xVal = xMin + i * (xMax - xMin) / xTicks;
    const x = xToSvg(xVal);
    const tick = createSVG("line", {
      x1: x, y1: h - padding,
      x2: x, y2: h - padding + 5,
      stroke: "black"
    });
    svg.appendChild(tick);

    const label = createSVG("text", {
      x: x, y: h - padding + 20,
      "text-anchor": "middle",
      "font-size": 10
    });
    label.textContent = xVal.toFixed(1);
    svg.appendChild(label);
  }

  // === Nhãn trục Y ===
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const yVal = maxPDF * i / yTicks;
    const y = yToSvg(yVal);
    const tick = createSVG("line", {
      x1: padding - 5, y1: y,
      x2: padding, y2: y,
      stroke: "black"
    });
    svg.appendChild(tick);

    const label = createSVG("text", {
      x: padding - 10, y: y + 3,
      "text-anchor": "end",
      "font-size": 10
    });
    label.textContent = yVal.toFixed(2);
    svg.appendChild(label);
    document.getElementById("varOut").innerText = `Variance (σ²) = ${(sigma ** 2).toFixed(4)}`;
  }

  // === Hiển thị xác suất ===
  const prob = normalCDF(xAbs, mu, sigma) - normalCDF(-xAbs, mu, sigma);
  document.getElementById("probOut").innerText = `P(|X| < ${xAbs}) = ${prob.toFixed(4)}`;
}

// Helper tạo SVG element
function createSVG(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}
