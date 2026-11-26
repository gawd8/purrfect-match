'use strict';
const nf = d3.format(','); const fmt = d3.format('.1f');
const ageOrder = ['Kitten (<1y)', 'Adult (1–<8y)', 'Senior (8y+)'];
const state = { coat: 'All', age: 'All', year: 'All' };
let rows = [];
const $ = s => document.querySelector(s);
function aggregate(data) { return { n: d3.sum(data, d => d.n), adopted: d3.sum(data, d => d.adopted) }; }
function rate(d) { return d.n > 0 ? 100 * d.adopted / d.n : 0; }
function filtered(exclude) { return rows.filter(d => (exclude === 'coat' || state.coat === 'All' || d.coat_group === state.coat) && (exclude === 'age' || state.age === 'All' || d.age_group === state.age) && (exclude === 'year' || state.year === 'All' || String(d.year) === state.year)); }
function summarize(data, key) { return d3.rollups(data, aggregate, d => d[key]).map(([name, values]) => ({ name, ...values })); }
function draw(target, items, filterKey, options = {}) {
    const w = 550, left = options.left || 124, right = 92, top = 16, bottom = 37, rowH = 36;
    const h = Math.max(155, items.length * rowH + top + bottom); const svg = d3.select(target).selectAll('svg').data([null]).join('svg').attr('viewBox', `0 0 ${w} ${h}`);
    svg.selectAll('*').remove();
    if (!items.length) { svg.append('text').attr('x', 20).attr('y', 50).text('No observations for this selection'); return; }
    const x = d3.scaleLinear().domain([0, 100]).range([left, w - right]); const y = d3.scaleBand().domain(items.map(d => d.name)).range([top, h - bottom]).padding(.24);
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${h - bottom})`).call(d3.axisBottom(x).tickValues([0, 25, 50, 75, 100]).tickFormat(d => d + '%').tickSize(-h + bottom + top));
    svg.select('.axis .domain').remove();
    const gg = svg.append('g');
    const group = gg.selectAll('g.item').data(items).join('g').attr('class', 'item').attr('role', 'button').attr('tabindex', 0).attr('aria-label', d => `${d.name}: ${fmt(rate(d))}% of ${nf(d.n)} records. Click to select.`);
    group.append('rect').attr('class', d => 'bar' + (state[filterKey] === d.name ? ' active' : ''))
        .attr('x', left).attr('y', d => y(d.name)).attr('width', d => Math.max(0, x(rate(d)) - left)).attr('height', y.bandwidth()).attr('rx', 3)
        .attr('fill', d => (d.name.startsWith('Black') || state[filterKey] === d.name) ? '#d99024' : '#58c7c2');
    group.append('text').attr('x', left - 9).attr('y', d => y(d.name) + y.bandwidth() / 2 + 4).attr('text-anchor', 'end').attr('font-size', options.fontSize || 12).text(d => d.name);
    group.append('text').attr('class', 'bar-label').attr('x', d => Math.min(w - 80, x(rate(d)) + 6)).attr('y', d => y(d.name) + y.bandwidth() / 2 + 4).text(d => `${fmt(rate(d))}% · ${nf(d.n)}`);
    const choose = (_event, d) => { state[filterKey] = state[filterKey] === d.name ? 'All' : d.name; sync(); };
    group.on('click', choose).on('keydown', (event, d) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(event, d); } });
}
function sync() {
    $('#coat-filter').value = state.coat; $('#age-filter').value = state.age; $('#year-filter').value = state.year;
    const all = aggregate(filtered()); $('#share').textContent = all.n ? fmt(rate(all)) + '%' : '—'; $('#count').textContent = nf(all.n);
    $('#selected-label').textContent = `${state.coat === 'All' ? 'All coats' : state.coat} · ${state.age === 'All' ? 'All ages' : state.age} · ${state.year === 'All' ? '2014–2024' : state.year}`;
    const ageMap = new Map(summarize(filtered('age'), 'age_group').map(d => [d.name, d]));
    const ages = ageOrder.map(name => ageMap.get(name) || { name, n: 0, adopted: 0 }).filter(d => d.n > 0);
    draw('#age-chart', ages, 'age', { left: 137 });
    const coats = summarize(filtered('coat'), 'coat_group').filter(d => d.n > 0).sort((a, b) => b.n - a.n).slice(0, 10);
    // Ensure currently selected coat is displayed, even outside the top ten.
    if (state.coat !== 'All' && !coats.some(d => d.name === state.coat)) {
        const wanted = summarize(filtered('coat'), 'coat_group').find(d => d.name === state.coat);
        if (wanted) { coats.pop(); coats.push(wanted); }
    }
    coats.sort((a, b) => rate(b) - rate(a)); draw('#coat-chart', coats, 'coat', { left: 143, fontSize: 11 });
    $('#insight').textContent = all.n ? `In this selection, ${nf(all.adopted)} of ${nf(all.n)} known outcome records (${fmt(rate(all))}%) were classified as Adoption. Change a filter or click a bar to explore another comparison.` : 'No records match the current filters. Try Reset filters.';
}
async function init() {
    try {
        const data = await d3.csv('data/cat_outcomes_aggregated.csv', d => ({ year: +d.year, age_group: d.age_group, coat_group: d.coat_group, n: +d.n, adopted: +d.adopted }));
        if (!data.length || data.some(d => !Number.isFinite(d.n) || !Number.isFinite(d.adopted))) throw new Error('Aggregate CSV is empty or invalid'); rows = data;
        const coats = [...new Set(rows.map(d => d.coat_group))].sort(); for (const name of coats) $('#coat-filter').add(new Option(name, name));
        const years = [...new Set(rows.map(d => d.year))].sort((a, b) => a - b); for (const name of years) $('#year-filter').add(new Option(name, name));
        $('#age-filter').add(new Option('Unknown age', 'Unknown age'));
        [['coat-filter', 'coat'], ['age-filter', 'age'], ['year-filter', 'year']].forEach(([id, key]) => $('#' + id).addEventListener('change', e => { state[key] = e.target.value; sync(); }));
        $('#reset').addEventListener('click', () => { state.coat = 'All'; state.age = 'All'; state.year = 'All'; sync(); }); sync();
    } catch (err) { console.error(err); const el = $('#error'); el.hidden = false; el.textContent = `Could not load chart data: ${err.message}. Preview this project through a local server or GitHub Pages, not file://.`; }
}
if (typeof d3 === 'undefined') { const el = $('#error'); el.hidden = false; el.textContent = 'D3.js did not load. Check internet connection.'; } else init();
