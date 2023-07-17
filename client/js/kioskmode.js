let KIOSKMODE={

    isKioskMode:function(){
        if (KIOSKMODE.flag === undefined) {
        let
            currentUrl = document.URL,
            urlParts = currentUrl.split('#');
            KIOSKMODE.flag = urlParts[1] == "kiosk";
        }
        return KIOSKMODE.flag;
    }

}