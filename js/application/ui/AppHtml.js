/*
 | Copyright 2016 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define([
  "application/base/selectors",
  "esri/support/basemapDefinitions",
  "esri/layers/FeatureLayer",
  "esri/webscene/Slide",
  "esri/core/Collection",
  "esri/views/MapView",
  "esri/Map",
  "esri/Viewpoint",
  "esri/geometry/Extent",
  "esri/PopupTemplate",
  "esri/core/watchUtils",
  "./FlareClusterLayer_v4",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/renderers/ClassBreaksRenderer",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/geometry/SpatialReference",
  "esri/request",

  //"./ClusterFeatureLayer",


  "dojo/_base/lang",

  "dojo/on",
  "dojo/touch",

  "dojo/dom",
  "dojo/dom-attr",
  "dojo/dom-class",
  "dojo/query",
  "dojo/dom-construct",

  "dojo/_base/declare",
], function (
  SELECTORS,
  basemapDefs, FeatureLayer,
  Slide, Collection, MapView, Map, Viewpoint, Extent, PopupTemplate,
  watchUtils,
  /*ClusterFeatureLayer,*/ FlareClusterLayer_v4, SimpleMarkerSymbol, ClassBreaksRenderer,
  SimpleFillSymbol, SimpleLineSymbol,SpatialReference,esriRequest,
  lang,
  on, touch,
  dom, domAttr, domClass, query, domConstruct,
  declare
) {

  return declare(null, {

    //--------------------------------------------------------------------------
    //
    //  Lifecycle
    //
    //--------------------------------------------------------------------------

    constructor: function (boilerplate, webItem, i18n) {

      this._boilerplate = boilerplate;

      this._webItem = webItem;

      this._isWebMap = this._getIsWebMap(webItem);

      this._i18n = i18n;

    },

    //--------------------------------------------------------------------------
    //
    //  Variables
    //
    //--------------------------------------------------------------------------

    _boilerplate: null,

    _webItem: null,

    _isWebMap: false,

    _i18n: null,

    _defaultBasemap: null,

    //--------------------------------------------------------------------------
    //
    //  Public Members
    //
    //--------------------------------------------------------------------------

    // Set content for menus and panels, no view required!

    setBaseHtml: function() {
      this.setNavbarHtml();
      this.setMenusHtml();
      this.setPanelsHtml();
      this.setWidgetsVisible();
      this.setActivePanelVisible();
    },

    setNavbarHtml: function() {
      this._setNavbarTitleText();
      this._setNavbarSubTitleText();
      this._setNavbarVisible(true);
    },

    setMenusHtml: function() {
      this._setMenuTitles();
      this._setMenusVisible(); // TODO
    },

    setPanelsHtml: function() {
      this._setPanelTitles();
      this._setAboutPanelText();
    },

    setWidgetsVisible: function() {
      // Nav Search
      this._setSearchWidgetVisible();
    },

    // Create content, requires view

    createViewPanelsHtml: function(view, webMapOrWebScene) {
    //  this._isWebMap.addLayer(layer);
      
    //init the layer, more options are available and explained in the cluster layer constructor
    //set up a class breaks renderer to render different symbols based on the cluster count. Use the required clusterCount property to break on.
      var url = "https://services1.arcgis.com/nCKYwcSONQTkPA4K/ArcGIS/rest/services/Gasolineras/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson";
      esriRequest(url, {
        responseType: "json"
      }).then(function(response){
        // The requested data
        var data = response.data.features;
        // Tratamos datos para que tengan la estructura que necesitamos
        var newData = data.map(function(dat) {
        return {
          "OBJECTID": dat.attributes.OBJECTID,
          "Provincia": dat.attributes.Provincia,
          "Municipio": dat.attributes.Municipio,
          "Localidad": dat.attributes.Localidad,
          "CodigoPostal": dat.attributes.CodigoPostal,
          "Direccion": dat.attributes.Direccion,
          "Margen": dat.attributes.Margen,
          "Rotulo": dat.attributes.Rotulo,
          "Horario": dat.attributes.Horario,
          "x": dat.geometry.x,
          "y": dat.geometry.y
        }
        });

      var defaultSym = new SimpleMarkerSymbol({
          size: 6,
          color: "#FF0000",
          outline: null
      });
      var renderer = new ClassBreaksRenderer({
          defaultSymbol: defaultSym
      });
      renderer.field = "clusterCount";
      var smSymbol = new SimpleMarkerSymbol({ size: 22, outline: new SimpleLineSymbol({ color: [221, 159, 34, 0.8] }), color: [255, 204, 102, 0.8] });
      var mdSymbol = new SimpleMarkerSymbol({ size: 24, outline: new SimpleLineSymbol({ color: [82, 163, 204, 0.8] }), color: [102, 204, 255, 0.8] });
      var lgSymbol = new SimpleMarkerSymbol({ size: 28, outline: new SimpleLineSymbol({ color: [41, 163, 41, 0.8] }), color: [51, 204, 51, 0.8] });
      var xlSymbol = new SimpleMarkerSymbol({ size: 32, outline: new SimpleLineSymbol({ color: [200, 52, 59, 0.8] }), color: [250, 65, 74, 0.8] });
      renderer.addClassBreakInfo(0, 19, smSymbol);
      renderer.addClassBreakInfo(20, 150, mdSymbol);
      renderer.addClassBreakInfo(151, 1000, lgSymbol);
      renderer.addClassBreakInfo(1001, Infinity, xlSymbol);
      var areaRenderer;
      // if area display mode is set. Create a renderer to display cluster areas. Use SimpleFillSymbols as the areas are polygons
      var defaultAreaSym = new SimpleFillSymbol({
          style: "solid",
          color: [0, 0, 0, 0.2],
          outline: new SimpleLineSymbol({ color: [0, 0, 0, 0.3] })
      });
      areaRenderer = new ClassBreaksRenderer({
          defaultSymbol: defaultAreaSym
      });
      areaRenderer.field = "clusterCount";
      var smAreaSymbol = new SimpleFillSymbol({ color: [255, 204, 102, 0.4], outline: new SimpleLineSymbol({ color: [221, 159, 34, 0.8], style: "dash" }) });
      var mdAreaSymbol = new SimpleFillSymbol({ color: [102, 204, 255, 0.4], outline: new SimpleLineSymbol({ color: [82, 163, 204, 0.8], style: "dash" }) });
      var lgAreaSymbol = new SimpleFillSymbol({ color: [51, 204, 51, 0.4], outline: new SimpleLineSymbol({ color: [41, 163, 41, 0.8], style: "dash" }) });
      var xlAreaSymbol = new SimpleFillSymbol({ color: [250, 65, 74, 0.4], outline: new SimpleLineSymbol({ color: [200, 52, 59, 0.8], style: "dash" }) });
      areaRenderer.addClassBreakInfo(0, 19, smAreaSymbol);
      areaRenderer.addClassBreakInfo(20, 150, mdAreaSymbol);
      areaRenderer.addClassBreakInfo(151, 1000, lgAreaSymbol);
      areaRenderer.addClassBreakInfo(1001, Infinity, xlAreaSymbol);
      // Set up another class breaks renderer to style the flares individually
      var flareRenderer = new ClassBreaksRenderer({
          defaultSymbol: renderer.defaultSymbol
      });
      flareRenderer.field = "clusterCount";
      var smFlareSymbol = new SimpleMarkerSymbol({ size: 14, color: [255, 204, 102, 0.8], outline: new SimpleLineSymbol({ color: [221, 159, 34, 0.8] }) });
      var mdFlareSymbol = new SimpleMarkerSymbol({ size: 14, color: [102, 204, 255, 0.8], outline: new SimpleLineSymbol({ color: [82, 163, 204, 0.8] }) });
      var lgFlareSymbol = new SimpleMarkerSymbol({ size: 14, color: [51, 204, 51, 0.8], outline: new SimpleLineSymbol({ color: [41, 163, 41, 0.8] }) });
      var xlFlareSymbol = new SimpleMarkerSymbol({ size: 14, color: [250, 65, 74, 0.8], outline: new SimpleLineSymbol({ color: [200, 52, 59, 0.8] }) });
      flareRenderer.addClassBreakInfo(0, 19, smFlareSymbol);
      flareRenderer.addClassBreakInfo(20, 150, mdFlareSymbol);
      flareRenderer.addClassBreakInfo(151, 1000, lgFlareSymbol);
      flareRenderer.addClassBreakInfo(1001, Infinity, xlFlareSymbol);
      // set up a popup template
     var popupTemplate = new PopupTemplate({
         title: "{Localidad}",
         content: [{
             type: "fields",
             fieldInfos: [
                 { fieldName: "Localidad", label: "Facility Type", visible: true },
                 { fieldName: "Localidad", label: "Post Code", visible: true },
                 { fieldName: "Localidad", label: "Opening Hours", visible: true }
             ]
         }]
     });
      var options = {
          id: "flare-cluster-layer",
          clusterRenderer: renderer,
          areaRenderer: areaRenderer,
          flareRenderer: flareRenderer,
         singlePopupTemplate: popupTemplate,
          spatialReference: new SpatialReference({ "wkid": 4326 }),
          subTypeFlareProperty: "facilityType",
          singleFlareTooltipProperty: "name",
          displaySubTypeFlares: true,
          maxSingleFlareCount: 8,
          clusterRatio: 75,
          clusterAreaDisplay: "activated",
          data: newData
      };
      // Accedemos a FlareClusterLayer que es una función de FlareClusterLayer_v4
      clusterLayer = new FlareClusterLayer_v4.FlareClusterLayer(options);
      view.map.add(clusterLayer);

    });

      // clusterLayer = new ClusterFeatureLayer({
      //         'url': 'https://services1.arcgis.com/nCKYwcSONQTkPA4K/arcgis/rest/services/Gasolineras/FeatureServer',
      //         'distance': 100,
      //         'id': 'clusters',
      //         'labelColor': '#fff',
      //         //'resolution': view.extent.getWidth() / view.width,
      //         'singleColor': '#888',
      //         //'singleTemplate': popupTemplate,
      //         'useDefaultSymbol': true,
      //         'objectIdField': 'FID' // define the objectid field
      //       });
      //
      // view.map.add(clusterLayer);

      this._setSlidesPanel(view, webMapOrWebScene);
      this._setDefaultBasemap(view);
      this._setBasemapPanel(view);
      this._setTooltips(view);

    },

    // Active panel

    setActivePanelVisible: function() {
      var panelName = this._boilerplate.config.activepanel;
      if (panelName) {
        var panelSelector;
        switch (panelName) {
          case "about":
            panelSelector = SELECTORS.panelAbout;
            break;
          case "legend":
            panelSelector = SELECTORS.panelLegend;
            break;
          case "layers":
            panelSelector = SELECTORS.panelLayers;
            break;
          case "basemaps":
            panelSelector = SELECTORS.panelBasemaps;
            break;
          case "bookmarks":
            panelName = "slides";
            panelSelector = SELECTORS.panelSlides;
            break;
          case "slides":
            panelSelector = SELECTORS.panelSlides;
            break;
          case "print":
            panelSelector = SELECTORS.panelPrint;
            break;
           case "share":
            panelSelector = SELECTORS.panelShare;
            break;
          default:
            panelSelector = null;
        }
        if (panelSelector) {
          var menu = this._boilerplate.config["menu" + panelName]; // has menu visible
          if (menu) {
            query(panelSelector + ", " + panelSelector + " .panel-collapse").addClass("in");
          }
        }
      }
    },

    showValidMenusOnly:function(view) {
      if (view.map) {
        // Only show menus if layers are present
        var cnt = view.map.layers.length;
        if (cnt === 0) {
          query(SELECTORS.menuLegend).addClass("hidden");
          query(SELECTORS.menuLayers).addClass("hidden");
        }
        // Printing is not supported in 3D
        if (!this._isWebMap) {
          query(SELECTORS.menuPrint).addClass("hidden");
        }
      }
    },

    //--------------------------------------------------------------------------
    //
    //  Private Methods
    //
    //--------------------------------------------------------------------------

    _getIsWebMap: function(webItem) {
      if (webItem && webItem.data && webItem.data.type) {
        return webItem.data.type === "Web Map";
      }
    },

    // Navbar Title

    _setNavbarTitleText: function() {
      if (this._boilerplate.config.title) {
        query(SELECTORS.mainTitle)[0].innerHTML = this._boilerplate.config.title;
      }
    },

    _setNavbarSubTitleText: function() {
     if (this._boilerplate.config.subtitle) {
        query(SELECTORS.titleDivider).removeClass("hidden");
        query(SELECTORS.subTitle)[0].innerHTML = this._boilerplate.config.subtitle;
      }
    },

    _setNavbarVisible: function(visible) {
      if (visible) {
        query(SELECTORS.navbar).removeClass("hidden");
      } else {
        query(SELECTORS.navbar).addClass("hidden");
      }
    },

    // Navbar Menu

    _setMenuTitles: function() {
      var i18n = this._i18n;
      query(SELECTORS.dropdownMenuTitle)[0].innerHTML = i18n.menu.title;
      query(SELECTORS.menuAbout + " a")[0].innerHTML = query(SELECTORS.menuAbout + " a")[0].innerHTML + "&nbsp;" + i18n.menu.items.about;
      query(SELECTORS.menuLegend + " a")[0].innerHTML = query(SELECTORS.menuLegend + " a")[0].innerHTML + "&nbsp;" + i18n.menu.items.legend;
      query(SELECTORS.menuLayers + " a")[0].innerHTML = query(SELECTORS.menuLayers + " a")[0].innerHTML + "&nbsp;" + i18n.menu.items.layers;
      query(SELECTORS.menuBasemaps + " a")[0].innerHTML = query(SELECTORS.menuBasemaps + " a")[0].innerHTML + "&nbsp;" + i18n.menu.items.basemaps;
      query(SELECTORS.menuSlides + " a")[0].innerHTML = query(SELECTORS.menuSlides + " a")[0].innerHTML + "&nbsp;" + (this._isWebMap ? i18n.menu.items.bookmarks : i18n.menu.items.slides);
      query(SELECTORS.menuShare + " a")[0].innerHTML = query(SELECTORS.menuShare + " a")[0].innerHTML + "&nbsp;" + i18n.menu.items.share;
      query(SELECTORS.menuPrint + " a")[0].innerHTML = query(SELECTORS.menuPrint + " a")[0].innerHTML + "&nbsp;" + i18n.menu.items.print;
      query(SELECTORS.menuToggleNav + " a")[0].innerHTML = query(SELECTORS.menuToggleNav + " a")[0].innerHTML + "&nbsp;" + i18n.menu.items.toggleNav;
    },

    // Panels

    _setPanelTitles: function() {
      var i18n = this._i18n;
      query(SELECTORS.panelAbout + " " + SELECTORS.panelTitle)[0].innerHTML = i18n.menu.items.about;
      query(SELECTORS.panelLegend + " " + SELECTORS.panelTitle)[0].innerHTML = i18n.menu.items.legend;
      query(SELECTORS.panelLayers + " " + SELECTORS.panelTitle)[0].innerHTML = i18n.menu.items.layers;
      query(SELECTORS.panelBasemaps + " " + SELECTORS.panelTitle)[0].innerHTML = i18n.menu.items.basemaps;
      query(SELECTORS.panelSlides + " " + SELECTORS.panelTitle)[0].innerHTML = (this._isWebMap ? i18n.menu.items.bookmarks : i18n.menu.items.slides);
      query(SELECTORS.panelPrint + " " + SELECTORS.panelTitle)[0].innerHTML = i18n.menu.items.print;
      query(SELECTORS.panelShare + " " + SELECTORS.panelTitle)[0].innerHTML = i18n.menu.items.share;
    },

    _setMenusVisible: function(boilerplate) {
      var boilerplate = this._boilerplate;
      // Remove main menu if no menus are visible
      if (boilerplate.config.menuabout === false && boilerplate.config.menulegend === false && boilerplate.config.menulayers === false && boilerplate.config.menubasemaps === false && boilerplate.config.menutogglenav === false && boilerplate.config.menuslides === false && boilerplate.config.menubookmarks === false) {
        query(SELECTORS.mainMenu).addClass("hidden");
        query(SELECTORS.title).addClass("calcite-title-left-margin");
      } else { // Hide menus, default is visible
        if (boilerplate.config.menuabout === false) {
          query(SELECTORS.menuAbout).addClass("hidden");
        }
        if (boilerplate.config.menulegend === false) {
          query(SELECTORS.menuLegend).addClass("hidden");
        }
        if (boilerplate.config.menulayers === false) {
          query(SELECTORS.menuLayers).addClass("hidden");
        }
        if (boilerplate.config.menubasemaps === false) {
          query(SELECTORS.menuBasemaps).addClass("hidden");
        }
        if (boilerplate.config.menuslides === false && boilerplate.config.menubookmarks === false) {
          query(SELECTORS.menuSlides).addClass("hidden");
        } else {
          boilerplate.config.menuslides = true;
          boilerplate.config.menubookmarks = true;
        }
        if (boilerplate.config.menushare === false) {
          query(SELECTORS.menuShare).addClass("hidden");
        }
        if (boilerplate.config.menutogglenav === false) {
          query(SELECTORS.menuToggleNav).addClass("hidden");
        }
      }
    },

    // Widgets

    _setSearchWidgetVisible: function() {
      var visible = this._boilerplate.config.searchnav;
      if (visible === false) {
        query(SELECTORS.widgetSearchContainer).addClass("hidden");
      }
    },

    // Panels

    _getAboutPanelText: function() {
      var config = this._boilerplate.config;
      var webItem = this._webItem;
      if (webItem && webItem.data) {
        var aboutText  = config.abouttext;
        var addSummary = config.aboutsummary;
        var addDesc = config.aboutdescription;
        var summaryText = null;
        var descriptionText = null;

        if (addDesc || addSummary) {
          descriptionText = webItem.data.description;
          summaryText =  webItem.data.snippet;
        }
        // Summary text
        if (addSummary && summaryText) {
          if (aboutText) {
            aboutText = aboutText + "<br>" +  summaryText;
          } else {
            aboutText = summaryText;
          }
        }
        // Description text
        if (addDesc && descriptionText) {
          if (aboutText) {
            aboutText = aboutText + "<br>" +  descriptionText;
          } else {
            aboutText = descriptionText;
          }
        }
        // TODO
        if (aboutText) {
          config.abouttext = aboutText;
        }
        return aboutText;
      }
    },

    _setAboutPanelText: function() {
      var aboutText = this._getAboutPanelText();
      if (aboutText) {
        // boilerplate.config.abouttext = aboutText; // TODO
        query(SELECTORS.panelAbout + " " + SELECTORS.panelBody)[0].innerHTML = aboutText;
      }
    },

    // Basemaps

    _setDefaultBasemap: function(view) {
      this._defaultBasemapId;
      view.then(function(){
        this._defaultBasemap = view.map.basemap;
      }.bind(this));
    },

    _setBasemapEvents: function(view) {
      if (view) {
        query("#selectBasemapPanel").on("change", function(e) {
          if (e.target.value === "Default") {
            view.map.basemap = this._defaultBasemap;
          } else {
            view.map.basemap = e.target.value;
          }
        }.bind(this));
      }
    },

    _setBasemapPanel: function(view) {
      if (view) {
        var id = "select";
        var title = "--- " + this._i18n.basemaps.select + " ---";
        // Add select option
        //var optionsHtml = "<option value='" + id + "'" + title + "</option>";
        var optionsHtml = "<option value='Default' selected>Default</option>";

        // Add all basemap options
        for (var key in basemapDefs) {
          if (basemapDefs.hasOwnProperty(key)){
            id = basemapDefs[key].id;
            title = basemapDefs[key].title;
            var option = "<option value='" + id + "'" + ">" + (id.indexOf("vector") > -1 ? "Vector " : "") + title + "</option>";
            optionsHtml += option;
          }
        }
        // Set HTML
        query("#selectBasemapPanel")[0].innerHTML = optionsHtml;
        this._setBasemapEvents(view);
      }
    },

    // Slides

    _createSlidesFromBookmarks: function(bookmarks) {
      var slides = new Collection();
      if (bookmarks) {
        for (var i = 0; i < bookmarks.length; i++) {
          var bookmark = bookmarks[i];
          var extent = new Extent({
                xmin: bookmark.extent.xmin,
                xmax: bookmark.extent.xmax,
                ymin: bookmark.extent.ymin,
                ymax: bookmark.extent.ymax,
                spatialReference: {wkid: bookmark.extent.spatialReference.wkid}
              });
          var slide = new Slide({
            id: bookmark.name.replace(/\s+/g, '_'),
            title: {text: bookmark.name},
            viewpoint: new Viewpoint({
              targetGeometry: extent
            }),
            thumbnail: {url: "images/bookmark.png"}
          });
          slides.add(slide);
        }
      }
      return slides;
    },

    _setSlidesPanel: function(view, webMapOrWebScene) {
      if (view && webMapOrWebScene) {

        // Prevent auto-start - configurable option?
        query(SELECTORS.carouselSlides).carousel({interval: false});

        // Build the slides when the view is ready
        view.then(function(view) {

          var slides;
          var isWebMap = this._isWebMap;

          var slideMap;

          function goToSlide(slide) {
            if (slide) {
              if (isWebMap) { // Map
                view.goTo({target: slide.viewpoint.targetGeometry});
              } else { // Scene
               slide.applyTo(view);
              }
            }
          }

          if (isWebMap) { // Map
            slides = this._createSlidesFromBookmarks(webMapOrWebScene.bookmarks);
            slideMap = new Map({
              basemap: view.map.basemap
            });
          } else { // Scene
            slides = webMapOrWebScene.presentation.slides;
          }

          // Create html
          if (slides && slides.length > 0) {
            var carouselIndicators = query(SELECTORS.carouselSlides + " .carousel-indicators")[0];
            var carouselInner = query(SELECTORS.carouselSlides + " .carousel-inner")[0];

            slides.forEach(function(slide, i) {
              var active = i === 0 ? "active" : "";
              var indicator = "<li data-target='#carouselSlides' data-slide-to=" + i + " data-toggle='tooltip' data-placement='bottom' title=" + slide.title.text + " class=" + active + "></li>";
              domConstruct.place(indicator, carouselIndicators, i);
              // FF to slide indicator
              query(SELECTORS.carouselSlides + " [data-slide-to=" + i + "]").on("click", function() {
                goToSlide(slide);
                query(SELECTORS.carouselSlides).carousel(i);
              });
              var item;
              if (isWebMap) {
                var mapId = slide.id + "map";
                item = "<div id=" + slide.id + " class='item " + active + "'><div class='slide-map' id='" + mapId + "'><div class='carousel-caption'>" + slide.title.text + "</div></div>";
              } else {
                item = "<div id=" + slide.id + " class='item " + active + "'><img src=" + slide.thumbnail.url + "><div class='carousel-caption'>" + slide.title.text + "</div></div>";
              }
              domConstruct.place(item, carouselInner, i);

              // Create a view for each slide
              if (isWebMap) {
                var slideView = new MapView({
                  container: mapId,
                  map: slideMap,
                  ui: {components: []},
                  extent: slide.viewpoint.targetGeometry
                });
                slideView.then(function(){
                  slideView.constraints = {
                    minScale: slideView.scale,
                    maxScale: slideView.scale,
                    rotationEnabled: false
                  }
                });
              }
            }.bind(this));

            // Zoom to slide after it is slid
            query(SELECTORS.carouselSlides).on("slid.bs.carousel", function(e) {
              var id = query(SELECTORS.carouselSlides + " .item.active")[0].id;
              if (slides) {
                var slide = slides.find(function(slide) {
                  return slide.id === id;
                });
                goToSlide(slide);
              }
            });

          } else {
            query(SELECTORS.menuSlides).addClass("hidden");
            query(SELECTORS.panelSlides).addClass("hidden");
          }
        }.bind(this));
      } else {
        query(SELECTORS.menuSlides).addClass("hidden");
        query(SELECTORS.panelSlides).addClass("hidden");
      }
    },


    // Bootstrap tooltips

    _setTooltips: function(view) {
      if (view) {
        view.then(function() {
          query('[data-toggle="tooltip"]').tooltip({
            "show": 100,
            "hide": 100,
            container: "panelSlides"
          });
        })
      }
    }

  })
});
