d3.csv("../../data/games.csv").then(data => {
  const container = d3.select("#victory-methods");
  if (!container.node()) return;

  const grouped = d3.rollup(
    data,
    v => v.length,
    d => d.victory_status || "unknown"
  );

  const pieData = Array.from(grouped, ([label, value]) => ({ label, value }));

  const width = 400;
  const radius = width / 2;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", width)
    .append("g")
    .attr("transform", `translate(${radius},${radius})`);

  const color = d3.scaleOrdinal()
    .domain(pieData.map(d => d.label))
    .range(d3.schemeSet2);

  const pie = d3.pie()
    .value(d => d.value);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

  const tooltip = container.append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("padding", "6px 12px")
    .style("background", "#222")
    .style("color", "white")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("pointer-events", "none");

  svg.selectAll("path")
    .data(pie(pieData))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.label))
    .attr("stroke", "white")
    .on("mouseover", (event, d) => {
      tooltip.html(`${d.data.label} : ${d.data.value}`)
        .style("visibility", "visible");
    })
    .on("mousemove", event => {
      tooltip.style("top", `${event.pageY - 30}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  svg.selectAll("text")
    .data(pie(pieData))
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "11px")
    .text(d => d.data.label);
});