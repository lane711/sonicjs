
(async function() {

  const data = {
    // labels: [
    //   'Red',
    //   'Blue',
    //   'Yellow'
    // ],
    datasets: [{
      label: 'Savings with Kevant',
      data: [48, 52],
      backgroundColor: [
        '#2fd6ff',
        '#999',
      ],
      hoverOffset: 4
    }]
  };


  new Chart(
    document.getElementById('case-chart-1'),
    {
  type: 'doughnut',
  data: data,
    }
  );
})();