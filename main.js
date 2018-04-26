//var auth = "FzaWATKl1iY95JHOy8N69CxuS3Cv80u6Gz4i4AjH";
//var auth = "Up3Aiy2P4maRphMEdUHCc8TQLF4BF7fNiCTFMZJk";
var auth = "YwdJjw1fPPXySjg4DK7pxexIGwN7eMKsZtydGJXn";

function getImages(pos){
    console.log("Gooood morning vietnammmm")
    var lat = pos.coords.latitude;
    var lon = pos.coords.longitude;
    var timeout = 1000;
    document.getElementById("status").textContent = "Finding image dates...";
    var asset_url = "https://api.nasa.gov/planetary/earth/assets?api_key=" + auth + "&lat=" + lat.toString() + "&lon=" + lon.toString();
    // use jquery for now, since it's easier to type out.
    $.get(asset_url,function(data){
       if(data.count < 1){
           document.getElementById("status").textContent = "Where are you!??!";
           document.getElementById("message").textContent = "There are no LANDSAT images available for your current location.";
           document.getElementsByClassName("progress-bar")[0].className = "progress-bar progress-bar-danger progress-bar-striped";
       } else{
           document.getElementById("status").textContent = "Finding image urls...";
           var pbar = document.getElementsByClassName("progress-bar")[0];
           pbar.className = "progress-bar";
           $('.progress-bar').css('width',0)
           var step = 100 / (data.results.length);
           var images = [];
           for(var i in data.results){
               // we do the setTimeout so we don't get a status code 429
               // (too many requests)
               // we have to declare the setTimeout inside a function, since
               // setTimeout is asyncronous. However, the function it's declared in IS syncronous.
               // otherwise it would just use the last value of [i], since the runs technically instantly.
               (function(j){
               setTimeout(function(){
                   var url = "https://api.nasa.gov/planetary/earth/imagery/?api_key=" + auth + "&lat=" + lat + "&lon=" + lon + "&date=" + data.results[j].date.substr(0,10);
                   $.getJSON(url,function(d){
                       if(d.error != undefined){
                        document.getElementById("status").textContent = "Error";
                        pbar.className = "progress-bar progress-bar-danger progress-bar-striped";
                        if(d.error.match(/code: 429/)){
                            document.getElementById("message").textContent = "Oops! Too many requests.";
                            throw Error("ABORT! WE SENT TOO MANY REQUESTS!");
                        } else{
                            throw Error("ABORT! WE MADE A BADE REQUEST!");
                        }
                       }
                       else{
                           var img = document.createElement("img");
                           img.src=d.url;
                           img.className = "LANDSAT"
                           img.dataset.date = d.date;
                           document.getElementById("images").appendChild(img);
                           document.getElementById("selector").innerHTML = "<input id=\"ex1\" data-slider-id=\'ex1Slider\' type=\"text\" data-slider-min=\"0\" data-slider-max=\"" + j + "\" data-slider-step=\"1\" data-slider-value=\"0\"/>"
                            $('#ex1').slider({
                            	formatter: function(value) {
                            		return 'Current value: ' + value;
                            	}
                            });
                            $("#ex1").on('change',function(event){
                            	    document.getElementById("images").children[event.value.newValue].style.display = "inherit";
                            	    document.getElementById("images").children[event.value.oldValue].style.display = "none";
                            	    document.getElementById("date").textContent = document.getElementById("images").children[event.value.newValue].dataset.date;
                            });
                       }
                   })
                    .fail(function(){
                        document.getElementById("status").textContent = "Error";
                        pbar.className = "progress-bar progress-bar-danger progress-bar-striped";
                    });
                   $('.progress-bar').css('width',j*step.toString() + "%").text((j * step).toString().substr(0,4));
               },j*timeout);
               }(i));
           }
           setTimeout(function(){
               $('.progress-bar').css('width',(100).toString() + "%").text((100).toString().substr(0,4));
               console.log(images);
           },data.results.length*timeout);
       }
    });
}
function getLocation(callback) {
    if (navigator.geolocation) {
        document.getElementById("status").textContent = "Aquiring Position...";
        navigator.geolocation.getCurrentPosition(callback);
    } else {
        //throw Error("Geolocation is not supported by this browser.");
        document.getElementById("status").textContent = "GPS is either restricted or unavailable on this Browser.";
    }
}
$(document).ready(function(){
  getLocation(getImages);  
})
