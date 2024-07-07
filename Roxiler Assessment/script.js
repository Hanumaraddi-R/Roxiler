document.addEventListener('DOMContentLoaded', function() {
    const monthSelect = document.getElementById('monthSelect');
    const searchInput = document.getElementById('searchInput');
    const transactionsTable = document.getElementById('transactionsTable').getElementsByTagName('tbody')[0];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalSales = document.getElementById('totalSales');
    const soldItems = document.getElementById('soldItems');
    const unsoldItems = document.getElementById('unsoldItems');
    const priceChart = document.getElementById('priceChart').getContext('2d');

    let currentPage = 1;
    let selectedMonth = parseInt(monthSelect.value);

    // Function to fetch transactions based on month, search, and pagination
    function fetchTransactions() {
        fetch(`/api/transactions?month=${selectedMonth}&searchText=${searchInput.value}&page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                // Clear previous rows
                transactionsTable.innerHTML = '';

                // Populate table with new data
                data.forEach(transaction => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${transaction.title}</td><td>${transaction.description}</td><td>${transaction.price}</td>`;
                    transactionsTable.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching transactions:', error));
    }

    // Function to fetch statistics for the selected month
    function fetchStatistics() {
        fetch(`/api/statistics?month=${selectedMonth}`)
            .then(response => response.json())
            .then(stats => {
                totalSales.textContent = `Total Sales: $${stats.totalSales.toFixed(2)}`;
                soldItems.textContent = `Sold Items: ${stats.soldItems}`;
                unsoldItems.textContent = `Unsold Items: ${stats.unsoldItems}`;
            })
            .catch(error => console.error('Error fetching statistics:', error));
    }

    // Function to fetch data for the price range chart
    function fetchPriceChart() {
        fetch(`/api/pricechart?month=${selectedMonth}`)
            .then(response => response.json())
            .then(chartData => {
                const priceLabels = chartData.map(data => data.priceRange);
                const itemCounts = chartData.map(data => data.itemCount);

                // Ensure chart is not already initialized to prevent duplication
                if (window.priceRangeChart) {
                    window.priceRangeChart.destroy();
                }

                window.priceRangeChart = new Chart(priceChart, {
                    type: 'bar',
                    data: {
                        labels: priceLabels,
                        datasets: [{
                            label: 'Number of Items',
                            data: itemCounts,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    stepSize: 1
                                }
                            }]
                        }
                    }
                });
            })
            .catch(error => console.error('Error fetching price chart data:', error));
    }

    // Initial fetch on page load
    fetchTransactions();
    fetchStatistics();
    fetchPriceChart();

    // Event listeners
    monthSelect.addEventListener('change', function() {
        selectedMonth = parseInt(monthSelect.value);
        fetchTransactions();
        fetchStatistics();
        fetchPriceChart();
    });

    searchInput.addEventListener('input', function() {
        fetchTransactions();
    });

    prevBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            fetchTransactions();
        }
    });

    nextBtn.addEventListener('click', function() {
        currentPage++;
        fetchTransactions();
    });
});
