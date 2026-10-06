// ==========================================
// CAMPUS LOCATIONS
// ==========================================

const locations = {

  "main-gate": {
    name: "Main Gate",
    x: 80,
    y: 560,
    type: "Entrance",
    description: "Main entrance of Acropolis Institute of Technology and Research."
  },

  reception: {
    name: "Reception Area",
    x: 200,
    y: 450,
    type: "Information",
    description: "First point of assistance for students and visitors."
  },

  "block-1": {
    name: "Block 1",
    x: 200,
    y: 425,
    type: "Academic Block",
    description: "Academic classrooms and departments."
  },

  "block-2": {
    name: "Block 2",
    x: 510,
    y: 310,
    type: "Academic Block",
    description: "Academic departments and classrooms."
  },

  "block-3": {
    name: "Block 3",
    x: 660,
    y: 150,
    type: "Academic Block",
    description: "Academic facilities and laboratories."
  },

  library: {
    name: "Central Library",
    x: 685,
    y: 438,
    type: "Academic Facility",
    description: "Main library with reading and study facilities."
  },

  canteen: {
    name: "Canteen",
    x: 355,
    y: 510,
    type: "Food",
    description: "Campus food and refreshment area."
  },

  sports: {
    name: "Sports Complex",
    x: 855,
    y: 535,
    type: "Sports",
    description: "Sports and recreational facilities."
  },

  transport: {
    name: "Transportation Office",
    x: 850,
    y: 450,
    type: "Office",
    description: "Transportation and bus-related assistance."
  },

  parking: {
    name: "Parking Area",
    x: 900,
    y: 550,
    type: "Parking",
    description: "Student and visitor parking area."
  },

  admin: {
    name: "Administrative Office",
    x: 130,
    y: 290,
    type: "Office",
    description: "Administrative services for students."
  },

  auditorium: {
    name: "Auditorium",
    x: 840,
    y: 295,
    type: "Event Facility",
    description: "Main auditorium for events and seminars."
  }
};


// ==========================================
// CAMPUS GRAPH
// ==========================================

const graph = {

  "main-gate": {
    reception: 120
  },

  reception: {
    "main-gate": 120,
    "block-1": 70,
    canteen: 170,
    admin: 210
  },

  "block-1": {
    reception: 70,
    canteen: 150,
    "block-2": 210
  },

  canteen: {
    reception: 170,
    "block-1": 150,
    "block-2": 190
  },

  "block-2": {
    "block-1": 210,
    canteen: 190,
    library: 180,
    "block-3": 190,
    auditorium: 230
  },

  library: {
    "block-2": 180,
    "block-3": 170,
    sports: 200,
    transport: 165
  },

  "block-3": {
    "block-2": 190,
    library: 170,
    auditorium: 180
  },

  auditorium: {
    "block-2": 230,
    "block-3": 180
  },

  transport: {
    library: 165,
    sports: 140
  },

  sports: {
    library: 200,
    transport: 140,
    parking: 100
  },

  parking: {
    sports: 100
  },

  admin: {
    reception: 210
  }
};


// ==========================================
// DOM ELEMENTS
// ==========================================

const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const routeLine = document.getElementById("routeLine");
const routeCard = document.getElementById("routeCard");
const errorBox = document.getElementById("error");


// ==========================================
// CREATE DROPDOWN OPTIONS
// ==========================================

function populateSelect(select) {

  Object.entries(locations)
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .forEach(([id, location]) => {

      const option = document.createElement("option");

      option.value = id;
      option.textContent = location.name;

      select.appendChild(option);

    });
}

populateSelect(fromSelect);
populateSelect(toSelect);


// ==========================================
// DIJKSTRA SHORTEST PATH
// ==========================================

function dijkstra(start, end) {

  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });

  distances[start] = 0;

  while (unvisited.size > 0) {

    let current = null;

    for (const node of unvisited) {

      if (
        current === null ||
        distances[node] < distances[current]
      ) {
        current = node;
      }

    }

    if (current === null || distances[current] === Infinity) {
      break;
    }

    unvisited.delete(current);

    if (current === end) {
      break;
    }

    for (const neighbor in graph[current]) {

      if (!unvisited.has(neighbor)) {
        continue;
      }

      const newDistance =
        distances[current] +
        graph[current][neighbor];

      if (newDistance < distances[neighbor]) {

        distances[neighbor] = newDistance;
        previous[neighbor] = current;

      }
    }
  }

  // Build path

  const path = [];

  let current = end;

  while (current !== null) {

    path.unshift(current);
    current = previous[current];

  }

  if (path[0] !== start) {
    return null;
  }

  return {
    path,
    distance: distances[end]
  };
}


// ==========================================
// BUILD SVG ROUTE
// ==========================================

function createRoutePath(path) {

  return path
    .map((id, index) => {

      const location = locations[id];

      return `${index === 0 ? "M" : "L"} ${location.x} ${location.y}`;

    })
    .join(" ");
}


// ==========================================
// DIRECTIONS
// ==========================================

function generateDirections(path) {

  const directions = [];

  directions.push(
    `Start from ${locations[path[0]].name}.`
  );

  for (let i = 1; i < path.length; i++) {

    const current = locations[path[i]];

    directions.push(
      `Continue toward ${current.name}.`
    );
  }

  directions.push(
    `You have reached ${locations[path[path.length - 1]].name}.`
  );

  return directions;
}


// ==========================================
// SHOW ROUTE
// ==========================================

function showRoute() {

  errorBox.textContent = "";

  const start = fromSelect.value;
  const destination = toSelect.value;

  if (!start || !destination) {

    errorBox.textContent =
      "Please select both your current location and destination.";

    return;
  }

  if (start === destination) {

    errorBox.textContent =
      "You are already at this location.";

    return;
  }

  const result = dijkstra(start, destination);

  if (!result) {

    errorBox.textContent =
      "No route is currently available between these locations.";

    return;
  }

  const routePath = createRoutePath(result.path);

  routeLine.setAttribute("d", routePath);
  routeLine.setAttribute("opacity", "1");

  // Clear previous marker classes

  document
    .querySelectorAll(".location circle")
    .forEach(circle => {
      circle.classList.remove(
        "start-marker",
        "destination-marker"
      );
    });

  // Mark start

  const startElement =
    document.querySelector(
      `.location[data-id="${start}"] circle`
    );

  if (startElement) {
    startElement.classList.add("start-marker");
  }

  // Mark destination

  const destinationElement =
    document.querySelector(
      `.location[data-id="${destination}"] circle`
    );

  if (destinationElement) {
    destinationElement.classList.add(
      "destination-marker"
    );
  }

  const distance = result.distance;

  const walkingTime =
    Math.max(1, Math.ceil(distance / 70));

  const directions =
    generateDirections(result.path);

  routeCard.innerHTML = `

    <div class="route-result">

      <h2>Route Found ✓</h2>

      <div class="route-summary">

        <strong>
          ${locations[start].name}
        </strong>

        ↓

        <strong>
          ${locations[destination].name}
        </strong>

        <div class="stats">

          <div class="stat">
            <strong>${distance} m</strong>
            <span>Distance</span>
          </div>

          <div class="stat">
            <strong>${walkingTime} min</strong>
            <span>Walking time</span>
          </div>

        </div>

      </div>


      <div class="directions">

        <h3>Directions</h3>

        <ol>

          ${directions
            .map(step => `<li>${step}</li>`)
            .join("")}

        </ol>

      </div>

    </div>
  `;
}


// ==========================================
// CLEAR ROUTE
// ==========================================

function clearRoute() {

  fromSelect.value = "";
  toSelect.value = "";

  routeLine.setAttribute("d", "");
  routeLine.setAttribute("opacity", "0");

  errorBox.textContent = "";

  document
    .querySelectorAll(".location circle")
    .forEach(circle => {

      circle.classList.remove(
        "start-marker",
        "destination-marker"
      );

    });

  routeCard.innerHTML = `

    <div class="route-empty">

      <div class="big-icon">🧭</div>

      <h2>Your route will appear here</h2>

      <p>
        Select your current location and destination
        to find the shortest campus route.
      </p>

    </div>

  `;
}


// ==========================================
// SWAP
// ==========================================

document.getElementById("swapBtn")
  .addEventListener("click", () => {

    const temporary = fromSelect.value;

    fromSelect.value = toSelect.value;
    toSelect.value = temporary;

  });


// ==========================================
// BUTTON EVENTS
// ==========================================

document
  .getElementById("findRoute")
  .addEventListener("click", showRoute);

document
  .getElementById("clearRoute")
  .addEventListener("click", clearRoute);


// ==========================================
// POPULAR DESTINATIONS
// ==========================================

document
  .querySelectorAll(".popular-list button")
  .forEach(button => {

    button.addEventListener("click", () => {

      const destination =
        button.dataset.location;

      toSelect.value = destination;

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });

  });


// ==========================================
// LOCATION SEARCH
// ==========================================

function enableSearch(select) {

  select.addEventListener("change", () => {

    const selected =
      locations[select.value];

    if (selected) {
      console.log(
        `${selected.name}: ${selected.description}`
      );
    }

  });

}

enableSearch(fromSelect);
enableSearch(toSelect);
