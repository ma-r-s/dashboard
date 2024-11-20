<script>
	import { ScatterChart, BarChart } from 'layerchart';
	import { scaleTime, scaleLinear } from 'd3-scale';

	let { data } = $props(); // Data passed from +page.js
	// Access the processed data for charts
	const processedData = data.logs;

	let groupedData = Object.entries(
		processedData.reduce((acc, log) => {
			const eventName = log.eventName || 'Unknown Event';
			if (!acc[eventName]) {
				acc[eventName] = { totalMilliseconds: 0, count: 0 };
			}
			acc[eventName].totalMilliseconds += log.Milliseconds;
			acc[eventName].count += 1;
			return acc;
		}, {})
	).map(([eventName, { totalMilliseconds, count }]) => ({
		eventName,
		averageMilliseconds: totalMilliseconds / count
	}));
</script>

<div class="p-4">
	<p class="mb-4 text-lg font-bold">EcoBites Analytics Dashboard</p>
	<div class="flex flex-wrap gap-4">
		<!-- Scatter Plot: Page Load Times -->
		<div class=" h-96 min-w-96 grow rounded-lg border px-10 pb-16">
			<p class=" py-4 text-sm font-bold">Page Load Times</p>
			<ScatterChart
				data={processedData}
				x="Time"
				y="Milliseconds"
				xScale={scaleTime()}
				yScale={scaleLinear()}
				xPadding={[20, 20]}
				yPadding={[20, 20]}
			/>
		</div>
		<!-- Bar Chart: Average Page Load Times -->
		<div class="h-96 min-w-96 grow rounded-lg border px-10 pb-16">
			<p class="py-4 text-sm font-bold">Average Ms per Event</p>

			<BarChart data={groupedData} x="eventName" y="averageMilliseconds" />
		</div>
	</div>
</div>
