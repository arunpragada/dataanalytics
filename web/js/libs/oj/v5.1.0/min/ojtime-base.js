/**
 * @license
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";define(["ojs/ojcore","jquery","ojs/ojcomponentcore","ojs/ojdvt-base","ojs/internal-deps/dvt/DvtToolkit","ojs/ojvalidation-datetime"],function(e,t,n,r,i){e.__registerWidget("oj.dvtTimeComponent",t.oj.dvtBaseComponent,{_GetEventTypes:function(){return["optionChange","viewportChange"]},_GetTranslationMap:function(){this.options.translations;var t=this._super(),n=e.LocaleData.getMonthNames("wide");t["DvtUtilBundle.MONTH_JANUARY"]=n[0],t["DvtUtilBundle.MONTH_FEBRUARY"]=n[1],t["DvtUtilBundle.MONTH_MARCH"]=n[2],t["DvtUtilBundle.MONTH_APRIL"]=n[3],t["DvtUtilBundle.MONTH_MAY"]=n[4],t["DvtUtilBundle.MONTH_JUNE"]=n[5],t["DvtUtilBundle.MONTH_JULY"]=n[6],t["DvtUtilBundle.MONTH_AUGUST"]=n[7],t["DvtUtilBundle.MONTH_SEPTEMBER"]=n[8],t["DvtUtilBundle.MONTH_OCTOBER"]=n[9],t["DvtUtilBundle.MONTH_NOVEMBER"]=n[10],t["DvtUtilBundle.MONTH_DECEMBER"]=n[11];var r=e.LocaleData.getDayNames("wide");t["DvtUtilBundle.DAY_SUNDAY"]=r[0],t["DvtUtilBundle.DAY_MONDAY"]=r[1],t["DvtUtilBundle.DAY_TUESDAY"]=r[2],t["DvtUtilBundle.DAY_WEDNESDAY"]=r[3],t["DvtUtilBundle.DAY_THURSDAY"]=r[4],t["DvtUtilBundle.DAY_FRIDAY"]=r[5],t["DvtUtilBundle.DAY_SATURDAY"]=r[6];var i=e.LocaleData.getDayNames("abbreviated");return t["DvtUtilBundle.DAY_SHORT_SUNDAY"]=i[0],t["DvtUtilBundle.DAY_SHORT_MONDAY"]=i[1],t["DvtUtilBundle.DAY_SHORT_TUESDAY"]=i[2],t["DvtUtilBundle.DAY_SHORT_WEDNESDAY"]=i[3],t["DvtUtilBundle.DAY_SHORT_THURSDAY"]=i[4],t["DvtUtilBundle.DAY_SHORT_FRIDAY"]=i[5],t["DvtUtilBundle.DAY_SHORT_SATURDAY"]=i[6],t},_HandleEvent:function(e){if("viewportChange"===e.type){var t=new Date(e.viewportStart).toISOString(),n=new Date(e.viewportEnd).toISOString(),r=e.minorAxisScale,i={viewportStart:t,viewportEnd:n,minorAxisScale:r};this._UserOptionChange("viewportStart",t),this._UserOptionChange("viewportEnd",n),this._UserOptionChange("minorAxis.scale",r),this._trigger("viewportChange",null,i)}else this._super(e)},_LoadResources:function(){null==this.options._resources&&(this.options._resources={});var t=this.options._resources;t.grabbingCursor=e.Config.getResourceUrl("resources/internal-deps/dvt/chart/hand-closed.cur"),t.grabCursor=e.Config.getResourceUrl("resources/internal-deps/dvt/chart/hand-open.cur");var n=e.Validation.converterFactory(e.ConverterFactory.CONVERTER_TYPE_DATETIME),r=n.createConverter({hour:"numeric",minute:"2-digit",second:"2-digit"}),i=n.createConverter({hour:"numeric",minute:"2-digit"}),o=n.createConverter({hour:"numeric"}),a=n.createConverter({month:"numeric",day:"2-digit"}),s=n.createConverter({month:"long"}),l={seconds:r,minutes:i,hours:o,days:a,weeks:a,months:s,quarters:s,years:n.createConverter({year:"numeric"})};t.converter=l,t.converterFactory=n,t.firstDayOfWeek=e.LocaleData.getFirstDayOfWeek()}}),e.CustomElementBridge.registerMetadata("dvtTimeComponent","dvtBaseComponent",{properties:{},methods:{getContextByNode:{}},extension:{_WIDGET_NAME:"dvtTimeComponent"}})});