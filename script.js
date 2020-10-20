//Choropleth with D3

document.addEventListener('DOMContentLoaded', function(){

		//Title
		d3.select("main")
		  .append("h1")
		  .attr("id", "title")
		  .text("Education in the United States");
		
		//Description
		d3.select("main")  
		  .append("p")
		  .attr("id", "description")
		  .text("Mapping by county of the percentage of adults aged 25 and more holding at least a Bachelor's degree (2010 - 2014)");

		//Parameters
		const w = 900;
		const h = 600; 

		//Path
		let path = d3.geoPath();
		
		//svg
		const svg = d3
			.select("main")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

		//fetch data
		let promises = []; 
		promises.push(d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"));
		promises.push(d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")); 

		Promise.all(promises)
			   .then(response => plotdata(response),
				   	error => {
						throw new Error(error.message);
					})
				.catch(error => { console.log(error.message); alert(error.message); });


		function plotdata(dataset){
		
		const map = dataset[0]; 
		const edu = dataset[1];

		//Min-Max
		const maxEdu = d3.max(edu, d => d.bachelorsOrHigher);
		const minEdu = d3.min(edu, d => d.bachelorsOrHigher);

		//Colors
		const colors = d3.scaleQuantize([minEdu, maxEdu], d3.schemeBlues[9])

		//Draw Counties
		svg.append("g")
		   .selectAll("path")
		   .data(topojson.feature(map,map.objects.counties).features)
		   .enter()
		   .append("path")
		   .attr("d", path)
		   .attr("transform", "scale(0.9)")
		   .attr("class", "county")
		   .attr("data-fips", d => d.id)
		   .attr("data-education", d => edu.filter( x => x.fips === d.id)[0].bachelorsOrHigher)
		   .attr("fill", d => colors(edu.filter( x => x.fips === d.id)[0].bachelorsOrHigher))

		// Legend
		svg.append("g")
		   .attr("id","legend")
		   .attr("transform","translate(" + 9/10 * w + " , " + 2/3 * h + ")");


		const legend = d3.legendColor()
						 .labelFormat(d3.format(".01f"))
						 .title("Percentage (%)")
					     .scale(colors);

		svg.select("#legend").call(legend);

		//Tooltip
		const tooltip = d3.select("main")
						  .append("div")
						  .attr("id","tooltip")
						  .style("position","absolute");

		svg.selectAll("path")
			.on("mouseover", function(event,d) {
			   		tooltip.transition().duration(100).style("visibility", "visible");
			   		tooltip.html(getTooltipText(d, edu))
			   			   .style("left", event.pageX + 20 + "px")     
                		   .style("top", event.pageY + "px")
			   			   .attr("data-education", edu.filter( x => x.fips === d.id)[0].bachelorsOrHigher);
			   			   // console.log(edu)
			})   
		  	.on("mouseout",function(event){
		  		tooltip.transition().duration(100).style("visibility", "hidden");
		  	})


		//Draw States
		svg.append("g")
		   .selectAll("path")
		   .data(topojson.feature(map,map.objects.states).features)
		   .enter()
		   .append("path")
		   .attr("d", path)
		   .attr("transform", "scale(0.9)")
		   .attr("stroke","white")
		   .attr("stroke-linejoin", "round")
		   .attr("fill","none")
		   .attr("class", "state");
		}

		//Get data for tooltip text
		function getTooltipText(d, edu){
			let htmlTooltip = ""; 

			htmlTooltip += edu.filter( x => x.fips === d.id)[0].area_name;
			htmlTooltip += "<br>State: ";
			htmlTooltip += edu.filter( x => x.fips === d.id)[0].state;
			htmlTooltip += "<br>";
			htmlTooltip += edu.filter( x => x.fips === d.id)[0].bachelorsOrHigher + " %";

			return htmlTooltip;
		}
});