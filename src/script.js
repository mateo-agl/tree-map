const h = 740;
const w = {svg: 1280, treemap: 1100};
const squareSize = 20;
const p = 15;

const main = d3.select('body')
  .append('div')
  .attr('id', 'main')

const heading = main.append('heading');

const svg = main.append('svg')
  .attr('height', h)
  .attr('width', w.svg)
  .attr("viewBox", [0, 0, w.svg, h])
  .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

heading.append('h1')
  .attr('id', 'title')
  .text('Kickstarter Pledges');
  
heading.append('h3')
  .attr('id', 'description')
  .text('Top 100 Most Valuable Kickstarter Pledges Grouped by Category');

d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json')
  .then(data => {
  const root = d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value)
  
  const treemap = d3.treemap()
    .size([w.treemap, h])
    .padding(1);
  
  const nodes = treemap(root)
    .leaves();
  
  const colorScale = d3.scaleSequential(d3.interpolateTurbo);
  
  const color = (category) => {
    let num;
    
    data.children.map((obj, i) => obj.name === category ? num = i / 19 : undefined);
    
    return colorScale(num)
  }
  
  const tiles = svg.selectAll('g')
    .data(nodes)
    .join('g')
      .attr("transform", d => `translate(${d.x0},${d.y0})`)
  
  tiles.append('rect')
      .attr('class', 'tile')
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.value)
      .attr('fill', d => color(d.data.category))
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr('name', d => d.data.name)
      .on('mouseover', (event, d) => {
        const x = event.pageX;
        const y = event.pageY;

        tooltip.style('opacity', 0.9)
          .attr('data-value', d.value)
          .style('top', y + 'px')
          .style('left', x + 'px')
          .html(d.data.name + '<br/>' +
                d.data.category + '<br/>' +
                format(d.value));
      })
        .on('mouseout', () => {
        tooltip.style('opacity', 0)
      })
  
  tiles.append('text')
    .style('font-size', '12px')
    .selectAll('tspan')
    .data(d => d.data.name.split(/\s/g))
    .join('tspan')
      .attr('x', '3')
      .attr('y', (d, i) => i + 1 + 'em')
      .text(d => d)
  
  const tooltip = d3.select('body')
      .append("div")
      .attr('id', 'tooltip');
  
  const format = d3.format(',d')
  
  const legend = svg.append('g')
    .attr('id', 'legend')
  
  const itemCont = legend.selectAll('g')
    .data(data.children)
    .enter()
    .append('g')
  
  itemCont.append('rect')
      .attr('class', 'legend-item')
      .attr('fill', d => color(d.name))
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('transform', (d, i) => 'translate(' + (w.treemap + p) + ', ' + 
            (p + (i + 1) * squareSize) + ')')
  
  itemCont.append('text')
    .attr('transform', (d, i) => 'translate(' + 
          (w.treemap + squareSize + (p * 2)) + ', ' + 
          ((p + (i + 1) * squareSize) + (squareSize / 1.3)) + ')')
    .text(d => d.name)
});