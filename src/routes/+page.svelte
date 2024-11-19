<script>
	import { ScatterChart } from 'layerchart';
	import { scaleTime, scaleLinear } from 'd3-scale';

	let { data } = $props(); // Data passed from +page.js
	// Access the processed data for charts
	const processedData = data.logs;
</script>

<h1 class="mb-4 text-lg font-bold">Analytics Dashboard</h1>

<!-- Scatter Plot: Page Load Times -->
<div class="mb-4 h-[400px] rounded border p-4">
	<h2 class="mb-2 text-sm font-bold">Page Load Times</h2>
	<ScatterChart
		data={processedData}
		x="Time"
		y="Milliseconds"
		padding={{ left: 40, bottom: 30, top: 10, right: 10 }}
		xScale={scaleTime()}
		yScale={scaleLinear()}
		yDomain={[0, null]}
	/>
</div>
