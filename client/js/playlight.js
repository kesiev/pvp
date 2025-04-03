let PLAYLIGHT={

    playlightSDK:0,

    isPlayLightMode:function(){
        if (PLAYLIGHT.flag === undefined) {
            let
                currentUrl = document.URL;
            PLAYLIGHT.flag = !!currentUrl.match("kesiev-pvp.netlify.app");
        }
        return PLAYLIGHT.flag;
    },

    moreGames:function() {
        PLAYLIGHT.playlightSDK.setDiscovery(true);
    },

    load:async function() {
        if (this.isPlayLightMode()) {
            let
                link = document.createElement("link"),
                head = document.getElementsByTagName('head')[0];
            link.setAttribute("rel","stylesheet");
            link.setAttribute("href","https://sdk.playlight.dev/playlight-sdk.css");
            link.setAttribute("media","print");
            link.onload=function() {
                this.media='all';
            }
            head.appendChild(link);
            try {
                const module = await import("https://sdk.playlight.dev/playlight-sdk.es.js");
                PLAYLIGHT.playlightSDK = module.default;
                await PLAYLIGHT.playlightSDK.init({
                    button:{
                        visible:false
                    },
                    exitIntent: {
                        enabled: true
                    }
                });
            } catch (error) {
                console.error("Error loading the Playlight SDK:", error);
            }
        }
    }

}