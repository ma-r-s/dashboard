<script>
	import { ScatterChart, BarChart, PieChart, AreaChart, LineChart } from 'layerchart';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Download } from 'lucide-svelte/icons';

	let { data } = $props();
	const processedData = data.logs;

	// Data processing logic remains unchanged
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

	let authData = [
		{ label: 'Authenticated', value: processedData.filter((log) => log.authenticated).length },
		{ label: 'Unauthenticated', value: processedData.filter((log) => !log.authenticated).length }
	];

	let allDates = [
		...new Set(processedData.map((log) => new Date(log.Time).toISOString().split('T')[0]))
	];
	let allEventNames = [...new Set(processedData.map((log) => log.eventName || 'Unknown Event'))];

	let eventFrequencyData = processedData.reduce((acc, log) => {
		const date = new Date(log.Time).toISOString().split('T')[0];
		const eventName = log.eventName || 'Unknown Event';
		if (!acc[date]) acc[date] = {};
		if (!acc[date][eventName]) acc[date][eventName] = 0;
		acc[date][eventName] += 1;
		return acc;
	}, {});

	allDates.forEach((date) => {
		if (!eventFrequencyData[date]) eventFrequencyData[date] = {};
		allEventNames.forEach((eventName) => {
			if (!eventFrequencyData[date][eventName]) eventFrequencyData[date][eventName] = 0;
		});
	});

	let multiSeriesData = allDates.map((dateStr) => {
		let date = new Date(dateStr);
		let entry = { date };
		allEventNames.forEach((eventName) => {
			entry[eventName] = eventFrequencyData[dateStr]?.[eventName] || 0;
		});
		return entry;
	});

	multiSeriesData.sort((a, b) => a.date - b.date);

	// Prepare data for LineChart: Average Milliseconds Over Time
	let dateSeriesData = multiSeriesData.map((entry) => {
		let totalMilliseconds = 0;
		let count = 0;
		allEventNames.forEach((eventName) => {
			totalMilliseconds +=
				entry[eventName] * groupedData.find((d) => d.eventName === eventName).averageMilliseconds;
			count += entry[eventName];
		});
		return {
			date: entry.date,
			value: count ? totalMilliseconds / count : 0
		};
	});
</script>

<div class="space-y-6 p-6 px-20">
	<!-- Header Section -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">EcoBites Analytics Dashboard</h1>
		<div class="flex items-center space-x-4">
			<Button href="/logs.csv">
				<Download class="mr-2 h-4 w-4" />
				Download Report
			</Button>
		</div>
	</div>

	<!-- Metrics Cards -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<div class="rounded bg-white p-4 shadow">
			<h3 class="text-sm font-medium">Total Events</h3>
			<div class="text-2xl font-bold">{processedData.length}</div>
			<p class="text-xs text-gray-500">Across all pages</p>
		</div>
		<div class="rounded bg-white p-4 shadow">
			<h3 class="text-sm font-medium">Authenticated Users</h3>
			<div class="text-2xl font-bold">{authData[0].value}</div>
			<p class="text-xs text-gray-500">Logged in sessions</p>
		</div>
		<div class="rounded bg-white p-4 shadow">
			<h3 class="text-sm font-medium">Unauthenticated Users</h3>
			<div class="text-2xl font-bold">{authData[1].value}</div>
			<p class="text-xs text-gray-500">Guest sessions</p>
		</div>
		<div class="rounded bg-white p-4 shadow">
			<h3 class="text-sm font-medium">Avg. Load Time</h3>
			<div class="text-2xl font-bold">
				{Math.round(
					groupedData.reduce((sum, item) => sum + item.averageMilliseconds, 0) / groupedData.length
				)}
				ms
			</div>
			<p class="text-xs text-gray-500">Across all events</p>
		</div>
	</div>

	<div class="flex flex-wrap gap-4">
		<!-- Bar Chart: Average Page Load Times -->
		<div class="h-96 min-w-96 grow rounded-lg border px-10 pb-16">
			<p class="py-4 text-sm font-bold">Average ms per Event</p>
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
		<!-- Line Chart: Average Milliseconds Over Time -->
		<div class="h-96 min-w-96 grow rounded-lg border px-10 pb-16">
			<p class="py-4 text-sm font-bold">Average Performance Over Time</p>
			<LineChart
				data={dateSeriesData}
				x="date"
				y="value"
				series={[{ key: 'value', color: '#FF6F61' }]}
			/>
		</div>
	</div>
	<footer class="mt-10 p-4 text-center text-gray-500">
		<p>© 2024 EcoBites. All rights reserved.</p>
		<p>
			<a
				href="https://github.com/mobile-dev-16/flutter_app"
				target="_blank"
				class="text-blue-500 hover:underline"
			>
				View Repository on GitHub
			</a>
		</p>
	</footer>
</div>
