    /**
     * Put number of seconds into HH:MM:SS format when time is more than or equals to 3600 (one hour) or MM:SS, otherwise.
     *
     * @param time Time, in seconds.
     * @return Returns a string represening time in HH:MM:SS or MM:SS format.
     */
    function secondsToHMS(time) {
        var h = 0;
        var m = 0;
        var s = 0;

        h = Math.floor(time / 3600);
        time -= 3600 * h;
        m = Math.floor(time / 60);
        time -= 60 * m;
        s = time;

        var str = '';

        if(h > 0) {
            str = twoDigit(h);
        }

        str += twoDigit(m) + ':';
        str += twoDigit(s);

        return str;
    }


    function cleanTable() {
        $('#result').html(' ');
    }

    function getMusicLarge(img, title, url, duration) {
        duration = secondsToHMS(duration);
        return '<div class="music-large"><div class="image"><img src="' + img + '"/><div class="duration">' + duration + '</div></div><div class="title"><a href="' + url + '">' + title + '</a></div><div class="play"><a href="' + url + '" title="' + title + '" class="addplaylist"><img src="/img/play_icon.png"/></a></div>';
    }

    function appendTable(img, title, url, duration) {
        $('#result').append(getMusicLarge(img, title, url, duration));
    }


    $(document).ready(function() {
        $('.music-large').live({mouseenter: function() {
            $(this).find('a').css('color', 'white');
            $(this).find('.play').css('display', 'block');
        },mouseleave: function() {
            $(this).find('a').css('color', 'black');
            $(this).find('.play').css('display', 'none');
        }});
    });
