(function(){
    var Request = new XMLHttpRequest();
    var movieList;
    var onScreenList;
    var currentPage = 1;
    var numOfItemsPerPage = 20;
    var languageTrack = {};

    document.getElementById("prev_btn").onclick = function(){
        changePage(currentPage - 1);
    };
    document.getElementById("next_btn").onclick = function(){
        changePage(currentPage + 1);
    };

    document.getElementById("search_input").addEventListener('keypress', function(e) {
        if(e.keyCode == 13){
            document.getElementById("loading_icon").style.display = "block";
            searchMovies(e.target.value);
        }
    });

    document.getElementById("loading_icon").style.display = "none";

    

    Request.addEventListener("progress", updateProgress);
    Request.addEventListener("load", transferComplete);
    Request.addEventListener("error", transferFailed);
    Request.addEventListener("abort", transferCanceled);

    Request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            responseAction(myArr);
        }
    };

    Request.open("GET", "movieslisting.json");

    Request.send();

    // progress on transfers from the server to the client (downloads)
    function updateProgress (oEvent) {
        if (oEvent.lengthComputable) {
            document.getElementById("movie_list_progress").style.display = "block";
            var percentComplete = oEvent.loaded / oEvent.total * 100;
            document.getElementById("movie_list_progress_bar").setAttribute("value", Math.floor(percentComplete));
            document.getElementById("movie_list_progress_percent").innerHTML = Math.floor(percentComplete)+" %";
        }
    }

    function transferComplete(evt) {
        document.getElementById("movie_list_progress").style.display = "none";
    }

    function transferFailed(evt) {
        console.log("An error occurred while transferring the file.");
    }

    function transferCanceled(evt) {
        console.log("The transfer has been canceled by the user.");
    }

    function responseAction(res) {
        movieList = res.movieList;

        updateMovieList(movieList, true);
    }

    function updateMovieList(updatedList, flag) {
        onScreenList = updatedList;
        var parentNode = document.getElementById("movie_list");
        var dummyNode = document.getElementById("dummy_node");
        currentPage = 1;

        if(flag)
        languageTrack = {};

        while (parentNode.hasChildNodes()) {
            parentNode.removeChild(parentNode.lastChild);
        }

        for(var i=0; i < onScreenList.length; i++){
            if(flag)
            languageTrack[onScreenList[i].language] = false;
            var newNode = dummyNode.cloneNode(true);
            newNode.setAttribute("id", "item"+i);
            newNode.querySelectorAll('.movie_title > a')[0].href = onScreenList[i].movie_imdb_link;
            newNode.querySelectorAll('.title_name')[0].innerHTML = i+1 + ". " +onScreenList[i].movie_title + " (" +onScreenList[i].title_year+ ")" ;
            newNode.querySelectorAll('.movie_genre')[0].innerHTML = (onScreenList[i].content_rating) ? (onScreenList[i].content_rating +" | "+ onScreenList[i].genres.split("|").join(", ")):onScreenList[i].genres.split("|").join(", ");
            newNode.querySelectorAll('.plot_keywords')[0].innerHTML = onScreenList[i].plot_keywords.split("|").join(", ");
            newNode.querySelectorAll('.director_name')[0].innerHTML = onScreenList[i].director_name;
            newNode.querySelectorAll('.actor_1_name')[0].innerHTML = onScreenList[i].actor_1_name;
            newNode.querySelectorAll('.actor_2_name')[0].innerHTML = onScreenList[i].actor_2_name;

            if((i >= ((currentPage - 1)*numOfItemsPerPage)) && (i < (currentPage*numOfItemsPerPage))) {
                newNode.style.display = "block";
            }
            else {
                newNode.style.display = "none";
            }

            parentNode.appendChild(newNode);

        }
        setTimeout(()=>{
            document.getElementById("loading_icon").style.display = "none";
        }, 200)

        if(flag)
        populateLanguage(languageTrack);
    }

    function changePage(pageNumber) {

        if(!onScreenList || !isPageValid(pageNumber)) return;

        for(var i=0; i < onScreenList.length; i++){

            var itemNode = document.getElementById("item"+i);

            if((i >= ((pageNumber - 1)*numOfItemsPerPage)) && (i < (pageNumber*numOfItemsPerPage))) {
                itemNode.style.display = "block";
            }
            else {
                itemNode.style.display = "none";
            }

        }

        currentPage = pageNumber;

    }

    function isPageValid(pageNumber) {
        if(pageNumber < 1 || pageNumber > Math.ceil(onScreenList.length/numOfItemsPerPage)) {
            return false;
        }
        else {
            return true;
        }
    }

    function searchMovies(keyword) {
        var updatedList = movieList.filter((movie)=>{
            return movie.movie_title.toUpperCase().search(keyword.toUpperCase()) > -1;
        });

        updateMovieList(updatedList, true);
    }

    function populateLanguage(languageTrack) {
        var parentNode = document.getElementById("language_filter");

        for (let key in languageTrack) {
            if(!key) continue;

            var input_box = document.createElement("INPUT");
            var input_value = document.createElement("SPAN");
            input_box.setAttribute("type", "checkbox");
            input_value.innerHTML = key;
            input_value.style.paddingRight = "10px";
    
            parentNode.appendChild(input_box);
            parentNode.appendChild(input_value);

            input_box.onchange = function(ev){
                languageTrack[key] = ev.target.checked;
                filterChange();
            }
        }
    }

    function filterChange() {
        var updatedList = [];

        for (let key in languageTrack) {
            if(languageTrack[key]) {
                updatedList = updatedList.concat(movieList.filter((movie)=>{
                    return movie.language.toUpperCase() == key.toUpperCase();
                }));
            }
            else {
                continue;
            }
        }

        updateMovieList(updatedList, false);
    }

})()
