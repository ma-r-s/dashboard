import Papa from 'papaparse';

export async function load({ fetch }) {
	const response = await fetch('/logs.csv');
	const csvText = await response.text();

	const { data, errors } = Papa.parse(csvText, {
		header: true,
		skipEmptyLines: true
	});

	if (errors.length) {
		console.error('Error parsing CSV:', errors);
	}

	// Helper function to parse day/month/year format
	function parseDateDMY(dateStr) {
		console.log(dateStr);
		const [day, month, year] = dateStr.split('/');
		return new Date(`${month}-${day}-${year}`);
	}

	// Preprocess the data
	const logs = data.map((row) => {
		// Extract milliseconds from message if not directly provided
		const milliseconds =
			parseInt(row.milliseconds) || parseInt((row.message.match(/(\d+)ms/) || [])[1]) || null;
		return {
			Time: parseDateDMY(row.timestamp), // Parse timestamp correctly as day/month/year
			Milliseconds: milliseconds, // Use extracted milliseconds
			authenticated: row.authenticated === 'TRUE', // Convert to boolean
			eventName: row.eventName || 'Unknown Event', // Default missing eventName
			hasError: row.__has_error__ === 'TRUE', // Convert to boolean
			message: row.message || null, // Retain message if needed
			// Retain only necessary metadata for reference
			key: {
				kind: row['__key__.kind'],
				name: row['__key__.name'],
				app: row['__key__.app']
			}
		};
	});

	return {
		logs // Preprocessed, ready-to-use data
	};
}
