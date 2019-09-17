const form = document.getElementById('vote-form');
form .addEventListener('submit', e => {
  const choice =  document.querySelector('input[name=os]:checked').value;
  const data = {os: choice};

  fetch('http://localhost:3000/poll', {
    method: 'post',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
    .then(res => res.json())
    .then(data => console.log(data))
    .then(err => console.log(err));

  e.preventDefault();
});

fetch('http://localhost:3000/poll')
  .then(res => res.json())
  .then(data => {
  // console.log(data);
  const votes = data.votes;
  const totalVotes = votes.length;

  document.querySelector('#chartTitle').textContent = `Total Votes: ${totalVotes}`;

  // Refresh the Total Votes every 2 seconds
  setInterval(() => {
    fetch('http://localhost:3000/poll')
      .then(res => res.json())
      .then(data => document.querySelector('#chartTitle').textContent = `Total Votes: ${data.votes.length}`)
      .catch(err => console.log(err));
  }, 2000);

  //Count vote points - acc/current
  const voteCounts = votes.reduce((acc, vote) =>
    (acc[vote.os] = ((acc[vote.os] || 0) + parseInt(vote.points)), acc));

  // Set initial Data Points
  if (Object.keys(voteCounts).length === 0 && voteCounts.constructor === Object) {
    voteCounts.Windows = 0;
    voteCounts.MacOS = 0;
    voteCounts.Linux = 0;
    voteCounts.Other = 0;
  }

  let dataPoints = [
    { label: 'Windows', y: voteCounts.Windows },
    { label: 'MacOS', y: voteCounts.MacOS },
    { label: 'Linux', y: voteCounts.Linux },
    { label: 'Other', y: voteCounts.Other },
  ]

  const chartContainer = document.querySelector('#chartContainer');
  if(chartContainer) {
    const chart = new CanvasJS.Chart('chartContainer', {
      animationEnabled: true,
      them: 'them1',
      data: [
        {
          type: 'column',
          dataPoints: dataPoints
        }
      ]
    });
    chart.render();

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var pusher = new Pusher('cf736a04cd143f3eaac1', {
      cluster: 'ap2',
      forceTLS: true
    });

    var channel = pusher.subscribe('os-poll');
    channel.bind('os-vote', function(data) {
      dataPoints = dataPoints.map(x => {
        if(x.label == data.os){
          x.y += data.points;
          return x;
        } else {
           return x;
        }
      });
      chart.render();
    });
  }
});
