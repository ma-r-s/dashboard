<script>
	import { Chart, Svg, Axis, Points } from 'layerchart';
	import { scaleTime, scaleLinear } from 'd3-scale';
	let { data } = $props(); // Data passed from +page.js
	// Access the processed data for charts
	const processedData = data.logs;
	console.log(processedData);

	// Chart configuration
	const padding = { left: 40, bottom: 30, top: 10, right: 10 };
</script>

<h1 class="mb-4 text-lg font-bold">Analytics Dashboard</h1>

<!-- Scatter Plot: Page Load Times -->
<div class="mb-4 h-[300px] rounded border p-4">
	<h2 class="mb-2 text-sm font-bold">Page Load Times</h2>
	<Chart
		data={processedData}
		x="timestamp"
		xScale={scaleTime()}
		y="milliseconds"
		yScale={scaleLinear()}
		yDomain={[0, null]}
		yNice
		{padding}
	>
		<Svg>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" format={(d) => new Date(d).toLocaleDateString()} rule />
			<Points class="fill-blue-500/30 stroke-blue-500" />
		</Svg>
	</Chart>
</div>

<!-- Additional Charts Go Here -->
