
var map = dc.geoChoroplethChart("#map")
            .projection(d3.geo.albersUsa()
                        .scale(500)
                        .translate([500 / 2, 300 / 2]))
var barchart = dc.barChart("#bar");
var barchart2 = dc.barChart("#bar2");
var industryChart = dc.bubbleChart("#industry");

d3.csv("assets/data/FinalData.csv", function (csv) {
    var data = crossfilter(csv);

    var user = data.dimension(function(d){return d.user_id;});//fix
    var usercount = user.groupAll();

    var pubyear = data.dimension(function(d){return d.year_publication;});
    var pubyearGroup = pubyear.group();

    var age = data.dimension(function(d){return d.age;});//fix
    var ageGroup = age.group();//fix

    var r2 = data.dimension(function(d){return d.book_rating;});//fix
    var ratingGroup = r2.group();
    console.log(ratingGroup.key);

    var states = data.dimension(function (d) {
        return d.state;
    });
    var avgStateRating = states.group().reduce(
                //add
                function (p, v) {
                    ++p.count;
                    p.total += +v.book_rating;
                    p.totalpub += +v.year_publication;
                    p.avg = p.total / p.count;
                    return p;
                },
                //remove
                function (p, v) {
                    --p.count;
                    p.total -= +v.book_rating;
                    p.totalpub -= +v.year_publication;
                    p.avg = p.count == 0 ? 0 : p.total / p.count;
                    return p;
                },
                //init
                function () {
                    return {count: 0,total: 0, totalpub: 0,avg: 0};
                }
        );
    var groupByState = states.group();
    console.log(groupByState);



    d3.json('assets/data/us-states.json',function(statesJson){
            map.width(500)
                .height(300)
                .dimension(states)
                .group(avgStateRating)
                .colors(['#dbdbdc', '#d8d9db', '#d5d7da', '#d2d4d8','#a293b9', '#a290b7', '#a18eb6', '#a08bb5', '#a089b3', '#9f87b2', '#9f84b0', '#9f82af', '#9e7fae', '#9e7dac', '#9e7bab', '#9e79aa', '#9e76a8', '#9e74a7', '#9e72a5', '#9e70a4', '#9f6da3', '#9f6ba1', '#9f69a0', '#9f679d', '#9d659a', '#9c6397', '#9a6194', '#995f90',"purple"])
                .colorDomain([-100,1500])
                .colorAccessor(function (p) {
                    return p.count;
                })
                .overlayGeoJson(statesJson.features, "state", function (d) {
                    return d.properties.name;
                });


            barchart.width(500) // (optional) define chart width, :default = 200
                .height(150) // (optional) define chart height, :default = 200
                .transitionDuration(500) // (optional) define chart transition duration, 
                .margins({top: 10, right: 50, bottom: 30, left: 60})
                .dimension(age)
                .group(ageGroup)
                .elasticY(true)
                .x(d3.scale.linear()
                    .domain([10,90])
                    .range([1,10]))
                .y(d3.scale.linear()
                    .domain([10,8000])
                    .range([1,10]))
                .xUnits(function(){return 90-10;})
                .brushOn(true)
                .renderTitle(true);

            barchart2.width(500) // (optional) define chart width, :default = 200
                .height(150) // (optional) define chart height, :default = 200
                .transitionDuration(500) // (optional) define chart transition duration, 
                .margins({top: 10, right: 50, bottom: 30, left: 60})
                .dimension(pubyear)
                .group(pubyearGroup)
                .elasticY(true)
                .x(d3.scale.linear()
                    .domain([1950,2005])
                    .range([1,10]))
                .y(d3.scale.linear()
                    .domain([10,8000])
                    .range([1,10]))
                .xUnits(function(){return 2005-1950;})
                .brushOn(true)
                .renderTitle(true);

            industryChart.width(500)
                .height(600)
                .margins({top: 30, right: 90, bottom: 50, left: 90})
                .dimension(states)
                .group(avgStateRating)
                .colors(["transparent"])
                .colorDomain([0,10])
                .keyAccessor(function (p) {
                    return (Math.random()-.5)*10;
                })
                .valueAccessor(function (p) {
                    return p.value.avg*10+3;
                })
                .radiusValueAccessor(function (p) {
                    return .11;
                })
                .colorAccessor(function (p) {
                    return 1;
                })
                .x(d3.scale.linear().domain([-15, 15]))
                .y(d3.scale.linear().domain([0, 110]))
                .r(d3.scale.linear().domain([0, 100]))
                .minRadiusWithLabel(0)
                .yAxisPadding(100)
                .maxBubbleRelativeSize(0.07)
                .renderLabel(true);

            industryChart.xAxis().tickValues([]).tickSize(0);

            dc.dataCount("#data-count")
                .dimension(data) // set dimension to all data
                .group(usercount); // set group to ndx.groupAll()

            dc.renderAll();
    });
});