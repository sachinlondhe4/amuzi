/*global  jPlayerPlaylist: false, jQuery:false */

//(function($, undefined) {
//    'use strict';

    var myPlaylist;
    var jplayerCss;
    var jPlaylistTop = null;
    var repeat;
    var current;
    var modalWrapper = "#load-modal-wrapper";
    var latestSearch;

    // Soon to be deprecated.
    function savePlaylist() {
        $.post('/playlist/save', {
            playlist: myPlaylist.original,
            name: myPlaylist.name
        }, function(data) {
        });
    }

    function playlistRollBottom() {
        $('.jp-playlist').scrollTop($('.jp-playlist').prop('scrollHeight'));
    }

    function addTrack(trackId, artist, musicTitle) {
        var options;
        var playNow = false;
        options = {
            id: trackId,
            playlist: myPlaylist.name,
            artist: artist,
            musicTitle: musicTitle
        };

        $.bootstrapMessageLoading();
        $.post('/playlist/addtrack', options, function(data) {
            $.bootstrapMessageAuto(data[0], data[1]);
            if('error' === data[1])
                loadPlaylist(myPlaylist.name);
            else if('success' === data[1]) {
                var v = data[2];
                var pOpt = {title: v.title, flv: v.url, free: true, id: v.id, trackId: v.trackId, artist_music_title_id: v.artistMusicTitleId, attrClass: "new", callback: playlistRollBottom}; // TODO: verify this.
                myPlaylist.add(pOpt, playNow);
            }
        }, 'json');
    }

    // TODO: take away the playlistName
    function rmTrack(trackId, playlistName) {
        playlistName = playlistName || 'default';
        $.bootstrapMessageLoading();
        $.post('/playlist/rmtrack', {
            playlist: playlistName,
            trackId: trackId
        }, function(data) {
            $.bootstrapMessageAuto(data[0], data[1]);
            if('error' === data[1])
                loadPlaylist(playlistName);
        }, 'json').error(function(e) {
            $.bootstrapMessageAuto('An error occured while trying to remove the track from your playlist.', 'error');
        });
    }

    /**
     * Load the an specific playlist or the default if an empty string is
     * especified. If a number is given, load the playlist by it's id.
     *
     * @param name Playlist's name, or an empty string to get the default
     * playlist.
     * @return void
     */
    function loadPlaylist(name) {
        name = name || '';
        myPlaylist.removeAll();
        var options;

        if(typeof(name) == 'number' || (typeof(name) == 'string' && parseInt(name) >= 0)) {
            // It's an ID
            if(typeof(name) == 'string')
                name = parseInt(name);
            options = { id: name };
        }
        else {
            // It's a name
            options = { name: name };
        }


        $.post('/playlist/load', options, function(data) {
            if(data != null) {
                $('.jp-title').css('display', 'block');
                $.each(data[0], function(i, v) {
                    myPlaylist.add({title: v.title, flv: v.url, free: true, id: v.id, artist_music_title_id: v.artist_music_title_id});
                });
                myPlaylist.name = data[1];
                setRepeatAndCurrent(parseInt(data[2]), parseInt(data[4]));
                setInterfaceShuffle(parseInt(data[3]));
                setTimeout(callbackShuffle, 1500);
            }
        }, 'json').complete(function() {
            if(commands.isRunCommand)
                setTimeout("commands.runProgram()", 1500);
        }).error(function(e) {
        });
    }

    function unloadPlaylist() {
        myPlaylist.name = null;
        myPlaylist.removeAll();
    }

    function rmPlaylist(name, callback) {
        $.bootstrapMessageLoading();
        $.post('/playlist/remove', {
            name: name
        }, function(data) {
            if ('success' === data[1] && 'function' === typeof callback) {
                callback(name);
            }
            $.bootstrapMessageAuto(data[0], data[1]);
        }, 'json');
    }

    function initAmuzi() {
        commands.isRunCommand = true;
        loadPlaylist();
    }

    function setRepeatAndCurrent(repeat, current) {
        myPlaylist.loop = repeat;
        myPlaylist.newCurrent = current;
    }

    function setPlaylistRepeat(name, repeat) {
        name = name || 'default';
    }

    function callbackPlay(current) {
        $.post('/playlist/setcurrent', {
            name: myPlaylist.name,
            current: current
        }, function(data) {
            if('error' == data[1])
                $.bootstrapMessageAuto(data[0], data[1]);
        }, 'json');
    }

    function callbackShuffle() {
        myPlaylist.setCurrent(myPlaylist.newCurrent);
        setInterfaceRepeat(myPlaylist.loop);
    }

    function applyOverPlaylist() {
        if($('#jp_container_1').length > 0) {
            if(!jPlaylistTop)
                jPlaylistTop = $('.jp-playlist').first().offset().top;
            var maxHeight = $(window).height() - jPlaylistTop - 45;
            $('.jp-playlist').css('max-height', maxHeight);
        }
    }

    // Repeat
    function setRepeat(repeat) {
        setInterfaceRepeat(repeat);
        $.post('/playlist/setrepeat', {
            name: myPlaylist.name,
            repeat: repeat
        }, function(data) {
            if('error' == data[1])
                $.bootstrapMessageAuto(data[0], data[1]);
        }, 'json');
    }

    function setInterfaceRepeat(repeat) {
        $('.jp-repeat-off').css('display', repeat ? 'block' : 'none');
        $('.jp-repeat').css('display', repeat ? 'none' : 'block');
    }


    function applyRepeatTriggers() {
        $('.jp-repeat').click(function(e) {
            setRepeat(true);
        });

        $('.jp-repeat-off').click(function(e) {
            setRepeat(false);
        });
    }

    // Shuffle
    function setShuffle(shuffle) {
        $.post('/playlist/setshuffle', {
            name: myPlaylist.name,
            shuffle: shuffle
        }, function(data) {
            if('error' == data[1])
                $.bootstrapMessageAuto(data[0], data[1]);
        }, 'json');
    }

    function setInterfaceShuffle(shuffle) {
        myPlaylist.shuffle(shuffle);
        $('.jp-shuffle-off').css('display', shuffle ? 'block' : 'none');
        $('.jp-shuffle').css('display', shuffle ? 'none' : 'block');
    }

    function applyShuffleTriggers() {
        $('.jp-shuffle').click(function(e) {
            setShuffle(true);
        });

        $('.jp-shuffle-off').click(function(e) {
            setShuffle(false);
        });
    }

    function applyPlaylistSettings() {
        $('.playlistsettings').ajaxForm({
            dataType: 'json',
            success: function (data) {
            },
            beforeSubmit: function() {
            }
        });
    }

    function isLoggedIn() {
        if($('#userId').length)
            return $('#userId').html();
        return false;
    }

    function playlistCallback() {
        $('#playlistsettings').ajaxForm({
            success: function(data) {
                $('#playlistsettings-result tbody').html(data);
            },
            error: function(data) {
                $.bootstrapMessageAuto(data, 'error');
            }
        });
    }

    function newPlaylistCallback() {
        $.bootstrapMessageLoading();
        $('form#newPlaylist').ajaxForm({
            dataType: 'json',
            success: function (data) {
                loadPlaylist($('input[name=name]').val());
                $.bootstrapMessageAuto(data[0], data[1]);
                $(modalWrapper).modal('hide');
                loadPlaylistSet();
            },
            error: function(data) {
                $.bootstrapMessageAuto('Error saving. Something went wrong', 'error');
                $('#load-modal-wrapper').modal('hide');
            }
        });
    }


    function shareLink(e) {
        e.preventDefault();
        $.post('/share', {
            url: $(this).attr('href')
        }, function(data) {
            $(modalWrapper + ' .modal-body').html(data);
            $(modalWrapper + ' h3').html('Share'); // TODO: translation
            $(modalWrapper).modal('show');
        });
    }

    function opacityFull(element) {
        element.addClass('opacity-full');
        element.removeClass('opacity-none');
    }

    function opacityNone(element) {
        element.addClass('opacity-none');
        element.removeClass('opacity-full');
    }

    function preparePlaylistEditName() {
        $('#playlistsettings-result tr').live('mouseover', function(e) {
            $('.playlist-edit-name img').css('opacity', '0.0');
            $(this).find('.playlist-edit-name img').css('opacity', '1.0');
        });

        $('#playlistsettings-result tr').live('mouseout', function(e) {
            $('.playlist-edit-name img').css('opacity', '0.0');
        });

        $('.playlist-edit-name a').live('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var td = $(this).parent().parent();
            td.find("span.playlist-name").css('display', 'none');
            td.find(".playlist-form-name").css('display', 'block');
            td.find("input#newname").val(td.find(".playlist-name").html());
            td.find("input#name").val(td.find(".playlist-name").html());
            td.find('.playlist-edit-name').css('display', 'none');
            $.bootstrapMessageLoading();
            td.find("form").ajaxForm({dataType: 'json', success: function(data) {
                $.bootstrapMessageAuto(data[0], data[1]);
                if('success' === data[1]) {
                    td.find('.playlist-name').html(td.find("input#newname").val());
                }
                td.find("span.playlist-name").css('display', 'block');
                td.find(".playlist-form-name").css('display', 'none');
                td.find('.playlist-edit-name').css('display', 'block');
            }});
        });

        $('.playlist-form-name').live('click', function(e) {
            e.stopPropagation();
        });
    }

    function handleAutocompleteChoice(ui) {
        if(ui.item.value != latestSearch) {
            $('#q').val(ui.item.value);
            $('#artist').val(ui.item.artist);
            $('#musicTitle').val(ui.item.musicTitle);
            $('form.search').submit();
            latestSearch = ui.item.value;
        }
    }

    function preparePlaylistActions() {
        $('.jp-playlist ul li div').live('mouseover', function(e) {
            $(this).find('.jp-free-media').css('opacity', '1.0').css('-moz-opacity', '1.0').css('filter', 'alpha(opacity=100)');
        });

        $('.jp-playlist ul li div').live('mouseleave', function(e) {
            $(this).find('.jp-free-media').css('opacity', '0.0').css('-moz-opacity', '0.0').css('filter', 'alpha(opacity=0)');
        });
    }

    function prepareMusicTrackVote() {
        var modalWrapper = '#load-modal-wrapper';
        $('.vote').live('click', function(e) {
            e.preventDefault();
            $.get($(this).attr('href'), function(data) {
                $.bootstrapMessageAuto(data[0], data[1]);
                $(modalWrapper).modal('hide');
            }, 'json').error(function(e) {
                $.bootstrapMessageAuto('Error registering vote', 'error');
                $(modalWrapper).modal('hide');
            });
        });

    }

    function verifyView() {
        var viewPaths = ['/', '/index/incboard'];
        var pathname = window.location.pathname;

        if (-1 !== viewPaths.indexOf(pathname)) {
            $.get('/user/getview', function(data) {
                if ('incboard' === data && '/index/incboard' !== pathname) {
                    window.location.pathname = '/index/incboard';
                } else if ('default' === data && '/' !== pathname) {
                    window.location.pathname = '/';
                }
            });
        }
    }

    function callback_userSettings(data) {
        verifyView();
    }

    function addToPlaylist(e) {
        var trackId = e.attr('trackId')

        var artist = e.parent().attr('artist'); 
        if ('undefined' === typeof artist) {
            artist = $('#artist').val();
        }

        var musicTitle = e.parent().attr('musicTitle');
        if ('undefined' === typeof musicTitle) {
            musicTitle = $('#musicTitle').val();
        }

        addTrack(trackId, artist, musicTitle);
        e.animate({top: 0, left: $(window).width()}, {
            complete: function() {
                e.remove();
            }
        });
    }

    function prepareVoteButton() {
    }

    function loadPlaylistSet() {
        $.get('/playlist/list', function(data) {
            $('.music-manager#playlists .stripe').html(data);
        }).error(function(data) {
        });
    }

    function prepareNewTracks() {
        $('.jp-playlist .new').live('hover', function(e) {
            $(this).removeClass('new');
        });
    }

    $(document).ready(function() {
        verifyView();

        // topbar menu
        $('.topbar').dropdown();

        $('.music-large').live('click', function(e) {
            e.preventDefault();
            addToPlaylist($(this));
        });

        $('.youtube-link, .download').live('click', function(e) {
            e.stopPropagation();
            myPlaylist.pause();
        });

        $('.youtube-link').live('click', function(e) {
            e.preventDefault();
            $.bootstrapLoadModalDisplay(
                'Youtube',
                '<iframe width="560" height="315" src="' + $(this).attr('href') + '" frameborder="0" allowfullscreen></iframe>',
                'big-modal'
            );
        });

        $('.jp-playlist-item-remove').live('click', function(e) {
            trackId = $(this).parent().parent().attr('track_id');
            rmTrack(trackId, myPlaylist.name);
        });

        // placeholder on the search input.
        $('#q').placeholder();
        // autocomplete the search input from last.fm.
        $.ui.autocomplete.prototype._renderItem = function(ul, row) {
            var a = $('<li></li>')
                .data('item.autocomplete', row)
                .append('<a>' + row.label + '</a>')
                .appendTo(ul);
            return a;
        };

        $('#q').autocomplete({
            source: function(request, response) {
                $.get('/api/autocomplete', {
                    q: request.term,
                }, function(data) {
                    var a =  $.map(data, function(row) {
                        return {
                            data: row,
                            label: '<img src="' + row.cover + '"/> <span>' + row.name + '</span>',
                            value: row.name,
                            artist: row.artist,
                            musicTitle: row.musicTitle
                        };
                    }, 'json');

                    response(a);
                }, 'json');
            },
            change: function(e, ui) {
                handleAutocompleteChoice(ui);
            },
            select: function(e, ui) {
                handleAutocompleteChoice(ui);
            },
            focus: function(e, ui) {
                $('#q').val(ui.item.value);
            },
            close: function(e, ui) {
            },
            open: function() {
                var left = $('.ui-autocomplete').position().left;
                $('.ui-autocomplete').css('left', (left + 15) + 'px');
            }
        });

        if($('#status-message').length > 0) {
            var message = $('#status-message p').html();
            var st = $('#status-message span.status').html();

            if($('#status-message').attr('noauto') === 'noauto')
                $.bootstrapMessage(message, st);
            else
                $.bootstrapMessageAuto(message, st);
        }

        // start the jplayer.
        jplayerCss = "#jp_container_1";
        myPlaylist = new jPlayerPlaylist({
            jPlayer: "#jquery_jplayer_1",
            cssSelectorAncestor: jplayerCss
        }, [], {supplied: 'flv', swfPath: "/obj/", free: true, callbackPlay: callbackPlay});

        $(jplayerCss + ' ul:last').sortable({
            update: function() {
                myPlaylist.scan();
                savePlaylist();
            }
        });

        applyOverPlaylist();
        applyRepeatTriggers();
        applyShuffleTriggers();
        applyPlaylistSettings();
        $(window).resize(function(e) {
            applyOverPlaylist();
        });

        //$('.loadModal').bootstrapLoadModal();
        $.bootstrapLoadModalInit();

        // For some reason, i can't call loadPlaylist right the way, it must wait for some initialization stuff.
        setTimeout('initAmuzi();', 1500);

        if(isLoggedIn())
            $('.loginRequired').fadeTo('slow', 1.0);

        // playlistsettings -> list
        $('#playlistsettings-result tbody tr.load').live('click', function(e) {
            loadPlaylist($(this).find('.name .playlist-name').html());
            $('#load-modal-wrapper').modal('hide');
        });

        $('#playlistsettings-result tbody tr .public').live('click', function(e) {
            var pub = $(this).val();
            e.stopPropagation();
            var name = $(this).parent().parent().find('.name').html();
            $.bootstrapMessageLoading();
            $.post('/playlist/privacy', {
                name: name,
                public: ($(this).attr('checked') === 'checked' ? 'public' : 'private')
            }, function(data) {
                $.bootstrapMessageAuto(data[0], data[1])
                $('#load-modal-wrapper').modal('hide');
            }, 'json');
        });

        // playlistsettings -> remove
        $('#playlistsettings-result tbody tr .remove').live('click', function(e) {
            e.stopPropagation();
            if(confirm('Are you sure?')) {
                var name = $(this).parent().parent().find('.name').html();
                rmPlaylist(name);
                if(name == myPlaylist.name)
                    loadPlaylist('');
                $('#load-modal-wrapper').modal('hide');
            }
        });

        $('#toc').tableOfContents(null, {startLevel:2});

        if('msie' === $.browser.name) {
            $.bootstrapMessage('Please upgrade to a better browser', 'error');
        }

        $('.share a').live('click', shareLink);
        preparePlaylistEditName();
        preparePlaylistActions();
        prepareMusicTrackVote();
        prepareNewTracks();

        $("#jquery_jplayer_1").bind($.jPlayer.event.ended + ".repeat", function() {
            $(this).jPlayer("play");
        });

        $.slideInit();
        loadPlaylistSet();
    });
//})(jQuery);
