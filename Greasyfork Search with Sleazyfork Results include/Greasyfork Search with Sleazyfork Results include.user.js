// ==UserScript==
// @name         Greasyfork Search with Sleazyfork Results include
// @name:zh-CN   大人的Greasyfork
// @name:zh-TW   大人的Greasyfork
// @namespace    hoothin
// @version      0.59
// @description  Merge adult results of sleazyfork into greasyfork when the script is no longer anonymously available, add rating score and version for scripts then
// @description:zh-CN 在sleazyfork查找成人内容后合并至greasyfork，访问匿名不可用脚本时跳转至sleazyfork，并添加评分与版本号
// @description:zh-TW 在sleazyfork查找成人內容後合並至greasyfork，訪問匿名不可用脚本時跳轉至sleazyfork，並添加評分與版本號
// @author       hoothin
// @include      http*://greasyfork.org/*
// @include      http*://www.greasyfork.org/*
// @include      http*://sleazyfork.org/*
// @include      http*://www.sleazyfork.org/*
// @grant        GM_xmlhttpRequest
// @connect      greasyfork.org
// @connect      sleazyfork.org
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=rixixi@sina.com&item_name=Greasy+Fork+donation
// @contributionAmount 1
// ==/UserScript==

(function() {
    'use strict';
    if(document.querySelector('span.sign-in-link')){
        var otherSite=/\/\/([^\.]+\.)?greasyfork\.org/.test(location.href)?"sleazyfork":"greasyfork";
        if(/scripts\/\d+/.test(location.href)){
            if(!document.querySelector("#script-info") && (otherSite == "greasyfork" || document.querySelector("div.width-constraint>p>a"))){
                location.href=location.href.replace(/\/\/([^\.]+\.)?(greasyfork|sleazyfork)\.org/,"//$1"+otherSite+"\.org");
            }
        }else if(/\/(scripts|users)\//.test(location.href)){
            GM_xmlhttpRequest({
                method: 'GET',
                url: location.href.replace(/\/\/([^\.]+\.)?(greasyfork|sleazyfork)\.org/,"//$1"+otherSite+"\.org"),
                onload: function(result) {
                    var doc = null;
                    try {
                        doc = document.implementation.createHTMLDocument('');
                        doc.documentElement.innerHTML = result.responseText;
                    }
                    catch (e) {
                        console.log('parse error');
                    }
                    if (!doc) {
                        return;
                    }
                    var l = doc.querySelector('ol.script-list');
                    if (l) {
                        var ml = document.querySelector('ol.script-list');
                        if(!ml){
                            ml=document.createElement("ol");
                            ml.setAttribute("class","script-list");
                            var list=document.querySelector('body>div.width-constraint');
                            var ps=list.querySelectorAll("p");
                            for(let i=0;i<ps.length;i++){
                                let p=ps[i];
                                list.removeChild(p);
                            }
                            list.appendChild(ml);
                        }
                        var scs=l.querySelectorAll("li");
                        if(scs){
                            for(let i=0;i<scs.length;i++){
                                let sc=scs[i];
                                if(!ml.querySelector("li[data-script-id='"+sc.getAttribute("data-script-id")+"']")){
                                    addScore(sc);
                                    ml.appendChild(sc);
                                }
                            }
                        }
                    }
                },
                onerror: function(e) {
                    console.log(e);
                }
            });
        }
    }
    function addScore(script){
        var separator=script.querySelector('h2>span.name-description-separator');
        var description=script.querySelector('h2>span.description');
        if(separator)separator.innerHTML="<strong style='color:#e09015'>"+script.getAttribute("data-script-rating-score")+"</strong>"+separator.innerHTML;
        if(description)description.innerHTML+="<strong>Ver."+script.getAttribute("data-script-version")+"</strong>";
    }
    var scripts=document.querySelectorAll('ol.script-list>li');
    for(let i=0;i<scripts.length;i++){
        let script=scripts[i];
        addScore(script);
    }
})();