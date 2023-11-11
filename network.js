    function simulate(data,svg)
    {
        let width = parseInt(svg.attr("viewBox").split(' ')[2])
        let height = parseInt(svg.attr("viewBox").split(' ')[3])
        let main_group = svg.append("g")
            .attr("transform", "translate(100, -150)")
            .attr("background-color","yellow")
    //calculate degree of the nodes:
        let node_degree={}; //initiate an object
        //console.log(data.nodes)
    d3.map(data.links,function (d){
        if(node_degree.hasOwnProperty(d.source))
        {
            node_degree[d.source]++
        }
        else{
            node_degree[d.source]=1
        }
        if(node_degree.hasOwnProperty(d.target))
        {
            node_degree[d.target]++
        }
        else{
            node_degree[d.target]=1
        }
    })
    
        let scale_radius = d3.scaleLinear()
            .domain(d3.extent(data.nodes, d => +d.Citations))
            .range([5,20])

        let scale_radius1 = d3.scaleLinear()
            .domain(d3.extent(data.nodes, d => +d.Publications))
            .range([5,20])

        let scale_radius2 = d3.scaleLinear()
            .domain(d3.extent(Object.values(node_degree)))
            .range([5,25])
        
    // Define an array of 80 custom colors
    const customColors = [
        "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896",
        "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7",
        "#bcbd22", "#dbdb8d", "#17becf", "#9edae5", "#393b79", "#5254a3", "#6b6ecf", "#9c9ede",
        "#637939", "#8ca252", "#b5cf6b", "#8c6d31", "#bd9e39", "#e7ba52", "#ce6dbd", "#de9ed6",
        "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#e7cb94",
        "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",
        "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
        "#636363", "#969696", "#bdbdbd", "#d9d9d9", "#8dd3c7", "#ffffb3", "#bebada", "#fb8072",
        "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#ffed6f", "#1f77b4", "#ff7f0e", "#2ca02c",
        "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#393b79"
    ];
    
    // Define a custom color scale with 80 custom colors
    let color = d3.scaleOrdinal()
        .domain([...new Set(data.nodes.map(d => d.Country))])
        .range(customColors);
        
        let link_elements = main_group.append("g")
            .attr('transform',`translate(${width/2},${height/2})`)
            .selectAll(".line")
            .data(data.links)
            .enter()
            .append("line")

        const treatCountryClass = (Country) => {
            // Remove any spaces, periods, commas, and slashes from the Country value
            let temp = Country.toString().replace(/[\s.,/]+/g, '');
            // Prepend "country_" to the modified Country value to create a class
            return "country_" + temp;
        }
    
        let node_elements = main_group.append("g")
            .attr('transform', `translate(${width / 2},${height / 2})`)
            .selectAll(".circle")
            .data(data.nodes)
            .enter()
            .append('g')
            .attr("class",function (d){
                return treatCountryClass(d.Country)})

            .on("mouseover",function (d,data){
                // add title to the info div
                d3.selectAll("#Paper_Title").html(
                    "<strong>Author Name:</strong> " + data.Name + "<br>" +
                    "<strong>Country:</strong> " + data.Country + "<br>" +
                    "<strong>Publications:</strong> " + data.Publications + "<br>" +
                    "<strong>Citations:</strong> " + data.Citations + "<br>" +
                    "<strong>Degree:</strong> " + (node_degree[data.id] || 0)
                );
                // make sure all items are inactive now
                node_elements.classed("inactive",true)
                // get the class of the hovered element
                const selected_class = d3.select(this).attr("class").split(" ")[0];
                //console.log(selected_class)
                // make all the hovered elements' class active
                d3.selectAll("."+selected_class)
                    .classed("inactive",false)
            })
            .on("mouseout",function (d,data){
                d3.select("#Paper_Title").text("")
                d3.selectAll(".inactive").classed("inactive",false)
            })
        node_elements.append("circle")
            .attr("r", function (d) {
                return scale_radius(+d.Citations);
            })
            .attr("fill", d => color(d.Country))
            .attr("opacity","1")


 // Add an event listener to the radio buttons to update legends
document.querySelectorAll('input[name="node-color"]').forEach(function (radioButton) {
    radioButton.addEventListener("change", function () {
        updateNodeColorAndLegends();
    });
});

// Function to update node color and legends based on the selected metric
function updateNodeColorAndLegends() {
    updateNodeColor();
    let selectedColorMetric = document.querySelector('input[name="node-color"]:checked').value;
    updateLegends(selectedColorMetric);
}
    // Check the initially selected color metric
    let initiallySelectedColorMetric = document.querySelector('input[name="node-color"]:checked').value;
    // Update the legend based on the initially selected color metric
    updateLegends(initiallySelectedColorMetric);

    // Function to update legends based on the selected color metric
    function updateLegends(selectedColorMetric) {
        // Remove existing legends
        d3.selectAll(".legend").selectAll("*").remove();

        // Update country legend or color legend based on the selected color metric
        if (selectedColorMetric === "Country") {
            updateCountryLegend();
        } else if (selectedColorMetric === "Degree Centrality") {
            updateDegreeCentralityLegend();
            console.log(selectedColorMetric)
        }
    }

    // Function to update the country legend
function updateCountryLegend() {
    let countryLegend = d3.select("#country-legend");
    let uniqueCountries = [...new Set(data.nodes.map(d => d.Country))];

    // Sort countries in ascending order
    uniqueCountries.sort((a, b) => a.localeCompare(b));

    // Specify the desired number of columns
    let numberOfColumns = 3;

    // Calculate the number of items per column
    let itemsPerColumn = Math.ceil(uniqueCountries.length / numberOfColumns);

    // Create a container for each column
    let columns = Array.from({ length: numberOfColumns }, (_, columnIndex) => {
        return countryLegend
            .append("div")
            .attr("class", "clegend-column")
            .style("display", "flex")
            .style("flex-direction", "column");
    });

    // Create legend entries for each country and distribute them among columns
    uniqueCountries.forEach((country, index) => {
        let columnIndex = Math.floor(index / itemsPerColumn);
        let currentColumn = columns[columnIndex];

        let legendEntry = currentColumn
            .append("div")
            .attr("class", "clegend-entry")
            .style("display", "flex")
            .style("margin-bottom", "8px"); // Add margin between legend entries

        // Append a colored rectangle next to each country name
        legendEntry
            .append("div")
            .attr("class", "clegend-color")
            .style("background-color", color(country))
            .style("width", "20px")  // Set the width of the rectangle
            .style("height", "10px"); // Set the height of the rectangle

        // Append the country name with some space
        legendEntry
            .append("span")
            .text(country)
            .style("margin-left", "5px")
            .style("margin-top", "-5px") // Add margin between rectangle and text
    });
}

// Function to update legends based on the selected color metric
function updateDegreeCentralityLegend() {
    let colorLegend = d3.select("#color-legend");
    colorLegend.selectAll("*").remove();  // Clear existing legends

    // Append the legend entries to the color legend div
    let legendEntries = colorLegend.selectAll(".dlegend-entry")
        .data(["Centrally distributed nodes", "Peripheral Nodes"])  // Data for two entries
        .enter()
        .append("div")
        .attr("class", "dlegend-entry")
        .style("display", "flex")
        .style("margin-bottom", "5px");

    legendEntries
        .append("div")
        .attr("class", "dlegend-color")
        .style("background-color", function (d, i) {
            return i === 0 ? "red" : "#4575b4";  // Set color based on index
        })
        .style("width", "20px")
        .style("height", "10px");

    legendEntries
        .append("div")
        .attr("class", "dlegend-text")
        .text(function (d) {
            return d;
        })
        .style("margin-left", "5px")
        .style("margin-top", "-5px");
}

    // Function to update the node color based on the selected metric
function updateNodeColor() {
    let selectedColorMetric = document.querySelector('input[name="node-color"]:checked').value;

    // Update the node color based on the selected metric
    if (selectedColorMetric === "Country") {
        node_elements.selectAll("circle")
            .attr("fill", d => color(d.Country));
    } else if (selectedColorMetric === "Degree Centrality") {
        node_elements.selectAll("circle")
            .attr("fill", function (d) {
                return (d['Bin Number'] >= 2 && d['Bin Number'] <= 5) ? "red" : "#4575b4";
            });
    }
}
    let collideInput = document.getElementById("collide");
    let collideValue = document.getElementById("collide-value");

    let linkStrengthInput = document.getElementById("link-strength");
    let linkStrengthValue = document.getElementById("link-strength-value");

    let chargeInput = document.getElementById("charge");
    let chargeValue = document.getElementById("charge-value");

    collideInput.addEventListener("input", updateCollideForce);
    linkStrengthInput.addEventListener("input", updateLinkStrengthMultiplier);
    chargeInput.addEventListener("input", updateChargeForce);

    let initialCollideRadius = 0;
    let collideForce = d3.forceCollide().radius(function (d) {
        return scale_radius(+d.Citations) + initialCollideRadius;
    });

    let linkForce = d3.forceLink(data.links)
    .id(function (d){
        return d.id})
        .strength(1);

        let chargeForce = d3.forceManyBody();

        let ForceSimulation = d3.forceSimulation(data.nodes)
            .force("collide", collideForce)
            //.force("x", d3.forceX())
            //.force("y", d3.forceY())
            .force("x", d3.forceX().strength(0.4))
            .force("y", d3.forceY().strength(0.4))
            .force("charge", chargeForce)
            .force("link",linkForce)
            .on("tick", ticked);

            node_elements.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        function ticked()
        {
        node_elements
            .attr('transform', function(d){return `translate(${d.x},${d.y})`})
            link_elements
                .attr("x1",function(d){return d.source.x})
                .attr("x2",function(d){return d.target.x})
                .attr("y1",function(d){return d.source.y})
                .attr("y2",function(d){return d.target.y})
            }

            function updateCollideForce() {
                let sliderValue = parseInt(collideInput.value);
                collideValue.textContent = sliderValue;
            
                // Update the "collide" force radius based on both "Citations" and the slider value
                collideForce.radius(function (d) {
                    return scale_radius(+d.Citations) + sliderValue;
                });
            
                // Restart the force simulation
                ForceSimulation.force("collide", collideForce); // Update the "collide" force
                ForceSimulation.alpha(0.5).restart();
            }

            function updateLinkStrengthMultiplier() {
                let strength = parseFloat(linkStrengthInput.value);
                linkStrengthValue.textContent = strength;
                linkForce.strength(strength);
                ForceSimulation.alpha(.5).restart();
            }

            // Function to update the charge force
        function updateChargeForce() {
            let strength = parseInt(chargeInput.value);
            chargeValue.textContent = strength;
            chargeForce.strength(strength);
            ForceSimulation.alpha(.5).restart();
        }

        // Define a variable to store the selected metric for node size
    let selectedNodeSizeMetric = "Citations"; // Default to "Number of Citations"

    // Function to update the node size based on the selected metric
    function updateNodeSize() {
        let selectedValue = document.querySelector('input[name="node-size"]:checked').value;

        // Update the selectedNodeSizeMetric variable
        selectedNodeSizeMetric = selectedValue;

        // Update the node size based on the selected metric
        node_elements.selectAll("circle")
            .attr("r", function (d) {
                if (selectedNodeSizeMetric === "Publications") {
                    return scale_radius1(+d.Publications);
                } else if (selectedNodeSizeMetric === "Node Degree") {
                    if(node_degree[d.id]!==undefined){
                        return scale_radius2(node_degree[d.id])
                    }
                    else{
                        return scale_radius2(0)
                    }
                } else if (selectedNodeSizeMetric === "Citations") {
                    return scale_radius(+d.Citations);
                }
            })

        // Restart the force simulation
        ForceSimulation.alpha(0.5).restart();
    }

    // Add an event listener to the radio buttons to update node size
    document.querySelectorAll('input[name="node-size"]').forEach(function (radioButton) {
        radioButton.addEventListener("change", updateNodeSize);
    });

            // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
        if (!event.active) ForceSimulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
        if (!event.active) ForceSimulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

        svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([1, 8])
            .on("zoom", zoomed));
        function zoomed({transform}) {
            main_group.attr("transform", transform);
        }
    }