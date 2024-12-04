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

	let orderAgainChartData = [
		{ date: new Date('2024-11-01'), count: 0 },
		{ date: new Date('2024-11-02'), count: 0 },
		{ date: new Date('2024-11-03'), count: 2 },
		{ date: new Date('2024-11-04'), count: 0 },
		{ date: new Date('2024-11-05'), count: 0 },
		{ date: new Date('2024-11-06'), count: 1 },
		{ date: new Date('2024-11-07'), count: 0 },
		{ date: new Date('2024-11-08'), count: 3 },
		{ date: new Date('2024-11-09'), count: 0 },
		{ date: new Date('2024-11-10'), count: 0 },
		{ date: new Date('2024-11-11'), count: 5 },
		{ date: new Date('2024-11-12'), count: 0 },
		{ date: new Date('2024-11-13'), count: 2 },
		{ date: new Date('2024-11-14'), count: 0 },
		{ date: new Date('2024-11-15'), count: 0 },
		{ date: new Date('2024-11-16'), count: 3 },
		{ date: new Date('2024-11-17'), count: 0 },
		{ date: new Date('2024-11-18'), count: 1 },
		{ date: new Date('2024-11-19'), count: 0 },
		{ date: new Date('2024-11-20'), count: 0 },
		{ date: new Date('2024-11-21'), count: 0 },
		{ date: new Date('2024-11-22'), count: 0 },
		{ date: new Date('2024-11-23'), count: 2 },
		{ date: new Date('2024-11-24'), count: 0 },
		{ date: new Date('2024-11-25'), count: 0 },
		{ date: new Date('2024-11-26'), count: 1 },
		{ date: new Date('2024-11-27'), count: 0 },
		{ date: new Date('2024-11-28'), count: 5 },
		{ date: new Date('2024-11-29'), count: 0 },
		{ date: new Date('2024-11-30'), count: 0 },
		{ date: new Date('2024-12-01'), count: 0 },
		{ date: new Date('2024-12-02'), count: 2 },
		{ date: new Date('2024-12-03'), count: 0 }
	];

	let avgFeatureUsageChartData = [
		{ eventName: 'search_restaurant', avgCount: 0.8 },
		{ eventName: 'view_profile', avgCount: 0.5 },
		{ eventName: 'filter_results', avgCount: 0.9 },
		{ eventName: 'share_deal', avgCount: 0.4 }
	];

	let createOrderChartData = [
		{ hour: 0, count: 5 },
		{ hour: 1, count: 3 },
		{ hour: 2, count: 2 },
		{ hour: 3, count: 1 },
		{ hour: 4, count: 0 },
		{ hour: 5, count: 1 },
		{ hour: 6, count: 4 },
		{ hour: 7, count: 8 },
		{ hour: 8, count: 12 },
		{ hour: 9, count: 15 },
		{ hour: 10, count: 20 },
		{ hour: 11, count: 18 },
		{ hour: 12, count: 22 },
		{ hour: 13, count: 25 },
		{ hour: 14, count: 19 },
		{ hour: 15, count: 16 },
		{ hour: 16, count: 18 },
		{ hour: 17, count: 24 },
		{ hour: 18, count: 30 },
		{ hour: 19, count: 35 },
		{ hour: 20, count: 40 },
		{ hour: 21, count: 33 },
		{ hour: 22, count: 25 },
		{ hour: 23, count: 12 }
	];

	let averageRatingData = [
		{ date: new Date('2024-11-01'), avgRating: 4.2 },
		{ date: new Date('2024-11-05'), avgRating: 4.3 },
		{ date: new Date('2024-11-10'), avgRating: 4.4 },
		{ date: new Date('2024-11-15'), avgRating: 4.3 },
		{ date: new Date('2024-11-20'), avgRating: 4.5 },
		{ date: new Date('2024-11-25'), avgRating: 4.6 },
		{ date: new Date('2024-11-30'), avgRating: 4.5 },
		{ date: new Date('2024-12-03'), avgRating: 4.6 }
	];

	let ratingDistributionData = [
		{ rating: 1, count: 3 },
		{ rating: 2, count: 2 },
		{ rating: 3, count: 8 },
		{ rating: 4, count: 12 },
		{ rating: 5, count: 15 }
	];
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
		<!-- Line Chart: Order Again Usage by Day -->
		<div class="h-96 w-[600px] min-w-96 grow rounded-lg border px-10 pb-44">
			<p class="py-4 text-sm font-bold">Order Again Usage by Day</p>
			<LineChart
				data={orderAgainChartData}
				x="date"
				y="count"
				series={[{ key: 'count', color: '#81C784' }]}
			/>
			<p class="mt-2 text-sm text-gray-600">
				This graph addresses the business question: <strong
					>"How frequently do users use the 'Order Again' feature?"</strong
				>
				It provides insights into user engagement with this feature over time, helping identify patterns
				and trends in repeat usage. High usage may indicate customer satisfaction and loyalty, while
				low usage might suggest areas for improvement in the user experience or feature visibility.
			</p>
		</div>

		<!-- Bar Chart: Features Used Less Than Once Per Week -->
		<div class="h-96 w-[600px] min-w-96 grow rounded-lg border px-10 pb-44">
			<p class="py-4 text-sm font-bold">Features Used Less Than Once Per Week</p>
			<BarChart data={avgFeatureUsageChartData} x="eventName" y="avgCount" cRange={['#FF6F61']} />
			<p class="mt-2 text-sm text-gray-600">
				This graph answers the question: <strong
					>"Which app features are used less than once per week by active users?"</strong
				>
				By identifying underused features, it helps prioritize improvements or decide whether certain
				functionalities should be redesigned, promoted, or even deprecated. This data supports better
				resource allocation and feature optimization.
			</p>
		</div>

		<div class="h-96 w-[600px] min-w-96 grow rounded-lg border px-10 pb-32">
			<p class="py-4 text-sm font-bold">Average Restaurant Rating Over Time</p>
			<LineChart
				data={averageRatingData}
				x="date"
				y="avgRating"
				series={[{ key: 'avgRating', color: '#6EC6FF' }]}
			/>
			<p class="mt-2 text-sm text-gray-600">
				This graph answers the question: <strong
					>"How do restaurant ratings change over time?"</strong
				>
				It provides insights into trends in customer satisfaction, helping identify periods where ratings
				improve or decline, and informs initiatives to maintain high-quality service.
			</p>
		</div>

		<div class="h-96 w-[600px] min-w-96 grow rounded-lg border px-10 pb-32">
			<p class="py-4 text-sm font-bold">Distribution of Restaurant Ratings</p>
			<BarChart
				data={ratingDistributionData}
				x="rating"
				y="count"
				cRange={['#FF6F61', '#FFD54F', '#6EC6FF', '#81C784']}
			/>
			<p class="mt-2 text-sm text-gray-600">
				This graph answers the question: <strong
					>"What is the distribution of restaurant ratings?"</strong
				>
				It highlights the overall satisfaction level of customers, helping identify patterns such as
				a high percentage of low ratings that may require attention.
			</p>
		</div>

		<!-- Bar Chart: Order Frequency by Hour -->
		<div class="h-96 min-w-96 grow rounded-lg border px-10 pb-32">
			<p class="py-4 text-sm font-bold">Order Frequency by Hour</p>
			<BarChart data={createOrderChartData} x="hour" y="count" cRange={['#FFD54F']} />
			<p class="mt-2 text-sm text-gray-600">
				This graph addresses the business question: <strong
					>"At what times do users most frequently buy surplus food?"</strong
				>
				It helps identify peak order times, which can inform marketing campaigns, app notifications,
				and partnerships with logistics companies. For example, peak times might indicate the need for
				additional delivery resources during certain hours.
			</p>
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
