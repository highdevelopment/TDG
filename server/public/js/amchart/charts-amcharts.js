var ChartsAmcharts = function() {
    var initChartSample9 = function() {
        var chart = AmCharts.makeChart("chart_9", {
            "type": "radar",
            "theme": "light",

            "fontFamily": 'Open Sans',
            
            "color":    '#888',

            "dataProvider": [{
                "country": "Czech Republic",
                "litres": 156.9
            }, {
                "country": "Ireland",
                "litres": 131.1
            }, {
                "country": "Germany",
                "litres": 115.8
            }, {
                "country": "Australia",
                "litres": 109.9
            }, {
                "country": "Austria",
                "litres": 108.3
            }, {
                "country": "UK",
                "litres": 99
            }],
            "valueAxes": [{
                "axisTitleOffset": 20,
                "minimum": 0,
                "axisAlpha": 0.15
            }],
            "startDuration": 2,
            "graphs": [{
                "balloonText": "[[value]] litres of beer per year",
                "bullet": "round",
                "valueField": "litres"
            }],
            "categoryField": "country",
            "exportConfig": {
                "menuTop": "10px",
                "menuRight": "10px",
                "menuItems": [{
                    "icon": '/lib/3/images/export.png',
                    "format": 'png'
                }]
            }
        });

        $('#chart_9').closest('.portlet').find('.fullscreen').click(function() {
            chart.invalidateSize();
        });
    }
    return {
        //main function to initiate the module

        init: function() {

            initChartSample9();
        }

    };

}();