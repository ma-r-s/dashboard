<script>
	import { ScatterChart, BarChart, PieChart, AreaChart } from 'layerchart';
	import { scaleTime, scaleLinear } from 'd3-scale';

	let { data } = $props(); // Data passed from +page.js
	const processedData = data.logs;

	// Group data by eventName and calculate the average Milliseconds for each page
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

	// Prepare data for authenticated vs. unauthenticated users
	let authData = [
		{ label: 'Authenticated', value: processedData.filter((log) => log.authenticated).length },
		{ label: 'Unauthenticated', value: processedData.filter((log) => !log.authenticated).length }
	];
	console.log(authData);

	// Extract all unique dates and event names
	let allDates = [
		...new Set(processedData.map((log) => new Date(log.Time).toISOString().split('T')[0]))
	];
	let allEventNames = [...new Set(processedData.map((log) => log.eventName || 'Unknown Event'))];

	// Group event counts by date and eventName
	let eventFrequencyData = processedData.reduce((acc, log) => {
		const date = new Date(log.Time).toISOString().split('T')[0]; // Format as YYYY-MM-DD
		const eventName = log.eventName || 'Unknown Event';

		// Initialize date entry
		if (!acc[date]) acc[date] = {};

		// Increment event count for this date
		if (!acc[date][eventName]) acc[date][eventName] = 0;
		acc[date][eventName] += 1;

		return acc;
	}, {});

	// Fill missing event counts with zeros
	allDates.forEach((date) => {
		if (!eventFrequencyData[date]) eventFrequencyData[date] = {}; // Initialize empty date entry
		allEventNames.forEach((eventName) => {
			if (!eventFrequencyData[date][eventName]) eventFrequencyData[date][eventName] = 0; // Fill missing events with zero
		});
	});

	// Convert to a format suitable for AreaChart
	let multiSeriesData = allDates.map((dateStr) => {
		let date = new Date(dateStr); // Convert to Date object
		let entry = { date }; // Start with the date
		allEventNames.forEach((eventName) => {
			entry[eventName] = eventFrequencyData[dateStr]?.[eventName] || 0; // Fill missing data with 0
		});
		return entry;
	});

	// Sort the data by the `date` field in ascending order
	multiSeriesData.sort((a, b) => a.date - b.date);
</script>

<div class="p-4">
	<p class="mb-4 text-lg font-bold">EcoBites Analytics Dashboard</p>
	<div class="flex flex-wrap gap-4">
		<!-- Bar Chart: Average Page Load Times -->
		<div class="h-96 min-w-96 grow rounded-lg border px-10 pb-16">
			<p class="py-4 text-sm font-bold">Average Ms per Event</p>
			<BarChart
				data={groupedData}
				x="eventName"
				y="averageMilliseconds"
				cRange={[
					'#FF6F61', // Deep Coral
					'#6EC6FF', // Sky Blue
					'#FFD54F', // Goldenrod
					'#81C784' // Spring Green
				]}
			/>
		</div>
		<!-- Pie Chart: Authentication Breakdown -->
		<div class="h-96 min-w-96 grow rounded-lg border px-10 pb-16">
			<p class="py-4 text-sm font-bold">Authentication Breakdown</p>
			<PieChart data={authData} key="label" value="value" cRange={['#81C784', '#FF6F61']} />
		</div>
		<!-- Scatter Plot: Page Load Times -->
		<div class="h-96 min-w-96 grow rounded-lg border px-10 pb-16">
			<p class="py-4 text-sm font-bold">Page Load Times</p>
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
		<!-- Area Chart: Event Frequency -->
		<div class="h-96 min-w-96 grow rounded-lg border px-10 pb-16">
			<p class="py-4 text-sm font-bold">Event Frequency Over Time</p>
			<AreaChart
				data={multiSeriesData}
				x="date"
				series={[
					{ key: 'Unknown Event', color: '#FF6F61' },
					{ key: 'splash_screen', color: '#6EC6FF' },
					{ key: 'homePageLoaded', color: '#FFD54F' },
					{ key: 'splashScreenUnauthenticated', color: '#81C784' }
				]}
				seriesLayout="stack"
			/>
		</div>
	</div>
</div>
