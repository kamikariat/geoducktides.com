import { useState, useMemo } from "react";
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Line, ComposedChart, Bar,
} from "recharts";

// ── Data ─────────────────────────────────────────────────────────────
// Format: amHigh/pmHigh/amLow/pmLow = [hour, minute, height]
// AM fields: hour is 24h (0=midnight, 12=noon)
// PM fields: code adds +12 if hour<12; 12 stays 12

const FEB_DATA = [
  { day:1, dow:"Sun", amHigh:[10,10,5.9], pmHigh:null, amLow:[4,37,2.3], pmLow:[5,32,-1.1], rise:"7:11 AM",set:"5:34 PM",riseH:7.197,setH:17.579,dayLen:"10h 22m",moon:"waxing-crescent" },
  { day:2, dow:"Mon", amHigh:[12,5,4.6], pmHigh:[11,0,5.7], amLow:[5,28,2.0], pmLow:[6,11,-0.9], rise:"7:10 AM",set:"5:35 PM",riseH:7.182,setH:17.598,dayLen:"10h 24m",moon:"waxing-crescent" },
  { day:3, dow:"Tue", amHigh:[12,40,4.7], pmHigh:[11,48,5.3], amLow:[6,18,1.8], pmLow:[6,48,-0.5], rise:"7:10 AM",set:"5:36 PM",riseH:7.167,setH:17.616,dayLen:"10h 26m",moon:"waxing-crescent" },
  { day:4, dow:"Wed", amHigh:[1,13,4.8], pmHigh:[12,36,4.8], amLow:[7,8,1.6], pmLow:[7,23,0.0], rise:"7:09 AM",set:"5:38 PM",riseH:7.152,setH:17.634,dayLen:"10h 28m",moon:"waxing-crescent" },
  { day:5, dow:"Thu", amHigh:[1,46,4.8], pmHigh:[1,25,4.3], amLow:[7,59,1.4], pmLow:[7,57,0.6], rise:"7:08 AM",set:"5:39 PM",riseH:7.136,setH:17.652,dayLen:"10h 31m",moon:"first-quarter" },
  { day:6, dow:"Fri", amHigh:[2,17,4.8], pmHigh:[2,20,3.8], amLow:[8,52,1.3], pmLow:[8,32,1.2], rise:"7:07 AM",set:"5:40 PM",riseH:7.119,setH:17.671,dayLen:"10h 33m",moon:"first-quarter" },
  { day:7, dow:"Sat", amHigh:[2,50,4.8], pmHigh:[3,28,3.3], amLow:[9,51,1.2], pmLow:[9,10,1.9], rise:"7:06 AM",set:"5:41 PM",riseH:7.102,setH:17.689,dayLen:"10h 35m",moon:"first-quarter" },
  { day:8, dow:"Sun", amHigh:[3,26,4.8], pmHigh:[5,3,3.1], amLow:[10,56,1.1], pmLow:[9,56,2.5], rise:"7:05 AM",set:"5:42 PM",riseH:7.085,setH:17.708,dayLen:"10h 37m",moon:"first-quarter" },
  { day:9, dow:"Mon", amHigh:[4,8,4.7], pmHigh:[7,8,3.1], amLow:null, pmLow:[12,6,0.9], rise:"7:04 AM",set:"5:43 PM",riseH:7.068,setH:17.726,dayLen:"10h 39m",moon:"waxing-gibbous" },
  { day:10, dow:"Tue", amHigh:[4,59,4.7], pmHigh:[8,36,3.4], amLow:null, pmLow:[1,13,0.7], rise:"7:03 AM",set:"5:44 PM",riseH:7.050,setH:17.745,dayLen:"10h 41m",moon:"waxing-gibbous" },
  { day:11, dow:"Wed", amHigh:[5,58,4.7], pmHigh:[9,24,3.6], amLow:[0,32,3.2], pmLow:[2,11,0.4], rise:"7:01 AM",set:"5:45 PM",riseH:7.032,setH:17.763,dayLen:"10h 43m",moon:"waxing-gibbous" },
  { day:12, dow:"Thu", amHigh:[6,57,4.8], pmHigh:[9,58,3.8], amLow:[1,45,3.2], pmLow:[2,59,0.1], rise:"7:00 AM",set:"5:46 PM",riseH:7.014,setH:17.782,dayLen:"10h 46m",moon:"waxing-gibbous" },
  { day:13, dow:"Fri", amHigh:[7,50,5.0], pmHigh:[10,27,3.9], amLow:[2,39,3.0], pmLow:[3,39,-0.1], rise:"6:59 AM",set:"5:47 PM",riseH:6.990,setH:17.800,dayLen:"10h 48m",moon:"full" },
  { day:14, dow:"Sat", amHigh:[8,38,5.1], pmHigh:[10,53,4.0], amLow:[3,22,2.8], pmLow:[4,14,-0.3], rise:"6:58 AM",set:"5:49 PM",riseH:6.972,setH:17.818,dayLen:"10h 50m",moon:"full" },
  { day:15, dow:"Sun", amHigh:[9,22,5.2], pmHigh:[11,17,4.1], amLow:[4,0,2.6], pmLow:[4,46,-0.5], rise:"6:57 AM",set:"5:50 PM",riseH:6.955,setH:17.835,dayLen:"10h 52m",moon:"full" },
  { day:16, dow:"Mon", amHigh:[10,4,5.2], pmHigh:[11,42,4.3], amLow:[4,36,2.3], pmLow:[5,17,-0.5], rise:"6:56 AM",set:"5:51 PM",riseH:6.936,setH:17.852,dayLen:"10h 55m",moon:"full" },
  { day:17, dow:"Tue", amHigh:[10,46,5.2], pmHigh:null, amLow:[5,13,2.0], pmLow:[5,46,-0.4], rise:"6:54 AM",set:"5:52 PM",riseH:6.916,setH:17.870,dayLen:"10h 57m",moon:"full" },
  { day:18, dow:"Wed", amHigh:[12,7,4.5], pmHigh:[11,29,5.0], amLow:[5,52,1.6], pmLow:[6,17,-0.2], rise:"6:53 AM",set:"5:53 PM",riseH:6.896,setH:17.888,dayLen:"10h 59m",moon:"waning-gibbous" },
  { day:19, dow:"Thu", amHigh:[0,34,4.7], pmHigh:[12,15,4.7], amLow:[6,34,1.3], pmLow:[6,48,0.2], rise:"6:52 AM",set:"5:54 PM",riseH:6.875,setH:17.905,dayLen:"11h 1m",moon:"waning-gibbous" },
  { day:20, dow:"Fri", amHigh:[1,2,4.9], pmHigh:[1,6,4.3], amLow:[7,20,0.9], pmLow:[7,22,0.7], rise:"6:51 AM",set:"5:55 PM",riseH:6.854,setH:17.924,dayLen:"11h 4m",moon:"waning-gibbous" },
  { day:21, dow:"Sat", amHigh:[1,33,5.1], pmHigh:[2,6,3.9], amLow:[8,12,0.7], pmLow:[7,58,1.4], rise:"6:49 AM",set:"5:56 PM",riseH:6.832,setH:17.941,dayLen:"11h 6m",moon:"third-quarter" },
  { day:22, dow:"Sun", amHigh:[2,8,5.2], pmHigh:[3,22,3.5], amLow:[9,11,0.5], pmLow:[8,40,2.0], rise:"6:48 AM",set:"5:57 PM",riseH:6.810,setH:17.958,dayLen:"11h 8m",moon:"third-quarter" },
  { day:23, dow:"Mon", amHigh:[2,51,5.2], pmHigh:[5,0,3.3], amLow:[10,20,0.3], pmLow:[9,34,2.6], rise:"6:47 AM",set:"5:58 PM",riseH:6.789,setH:17.975,dayLen:"11h 11m",moon:"third-quarter" },
  { day:24, dow:"Tue", amHigh:[3,44,5.2], pmHigh:[6,50,3.4], amLow:[11,39,0.1], pmLow:[10,53,3.0], rise:"6:46 AM",set:"5:59 PM",riseH:6.768,setH:17.990,dayLen:"11h 13m",moon:"waning-crescent" },
  { day:25, dow:"Wed", amHigh:[4,51,5.2], pmHigh:[8,9,3.6], amLow:null, pmLow:[12,58,-0.1], rise:"6:44 AM",set:"6:00 PM",riseH:6.746,setH:18.009,dayLen:"11h 15m",moon:"waning-crescent" },
  { day:26, dow:"Thu", amHigh:[6,5,5.2], pmHigh:[9,2,3.9], amLow:[0,29,3.1], pmLow:[2,5,-0.4], rise:"6:43 AM",set:"6:01 PM",riseH:6.722,setH:18.027,dayLen:"11h 18m",moon:"waning-crescent" },
  { day:27, dow:"Fri", amHigh:[7,16,5.3], pmHigh:[9,43,4.2], amLow:[1,49,2.8], pmLow:[3,1,-0.6], rise:"6:41 AM",set:"6:02 PM",riseH:6.699,setH:18.046,dayLen:"11h 20m",moon:"waning-crescent" },
  { day:28, dow:"Sat", amHigh:[8,19,5.4], pmHigh:[10,20,4.4], amLow:[2,52,2.5], pmLow:[3,48,-0.7], rise:"6:40 AM",set:"6:03 PM",riseH:6.676,setH:18.063,dayLen:"11h 23m",moon:"new" },
];

const MAR_DATA = [
  { day:1, dow:"Sun", amHigh:[9,16,5.4], pmHigh:[10,53,4.6], amLow:[3,46,2.0], pmLow:[4,29,-0.7], rise:"6:43 AM",set:"6:05 PM",riseH:6.717,setH:18.083,dayLen:"11h 22m",moon:"waxing-crescent" },
  { day:2, dow:"Mon", amHigh:[10,7,5.3], pmHigh:[11,25,4.7], amLow:[4,34,1.6], pmLow:[5,6,-0.5], rise:"6:41 AM",set:"6:06 PM",riseH:6.683,setH:18.100,dayLen:"11h 25m",moon:"waxing-crescent" },
  { day:3, dow:"Tue", amHigh:[10,55,5.0], pmHigh:[11,54,4.8], amLow:[5,19,1.2], pmLow:[5,40,-0.2], rise:"6:40 AM",set:"6:07 PM",riseH:6.667,setH:18.117,dayLen:"11h 27m",moon:"waxing-crescent" },
  { day:4, dow:"Wed", amHigh:[11,42,4.7], pmHigh:null, amLow:[6,3,0.9], pmLow:[6,13,0.3], rise:"6:38 AM",set:"6:08 PM",riseH:6.633,setH:18.133,dayLen:"11h 30m",moon:"waxing-crescent" },
  { day:5, dow:"Thu", amHigh:[0,22,4.9], pmHigh:[12,29,4.4], amLow:[6,45,0.7], pmLow:[6,45,0.8], rise:"6:37 AM",set:"6:09 PM",riseH:6.617,setH:18.150,dayLen:"11h 32m",moon:"first-quarter" },
  { day:6, dow:"Fri", amHigh:[0,49,4.9], pmHigh:[1,18,4.0], amLow:[7,27,0.6], pmLow:[7,16,1.3], rise:"6:35 AM",set:"6:10 PM",riseH:6.583,setH:18.167,dayLen:"11h 35m",moon:"first-quarter" },
  { day:7, dow:"Sat", amHigh:[1,16,4.9], pmHigh:[2,12,3.6], amLow:[8,11,0.6], pmLow:[7,49,1.9], rise:"6:34 AM",set:"6:11 PM",riseH:6.567,setH:18.183,dayLen:"11h 37m",moon:"first-quarter" },
  { day:8, dow:"Sun", amHigh:[1,45,4.8], pmHigh:[4,17,3.3], amLow:[9,59,0.6], pmLow:[9,24,2.4], rise:"7:32 AM",set:"7:12 PM",riseH:7.533,setH:19.200,dayLen:"11h 40m",moon:"first-quarter" },
  { day:9, dow:"Mon", amHigh:[3,19,4.7], pmHigh:[5,47,3.2], amLow:[10,55,0.7], pmLow:[10,9,2.8], rise:"7:31 AM",set:"7:13 PM",riseH:7.517,setH:19.217,dayLen:"11h 42m",moon:"waxing-gibbous" },
  { day:10, dow:"Tue", amHigh:[4,2,4.5], pmHigh:[7,45,3.2], amLow:null, pmLow:[12,2,0.7], rise:"7:29 AM",set:"7:14 PM",riseH:7.483,setH:19.233,dayLen:"11h 45m",moon:"waxing-gibbous" },
  { day:11, dow:"Wed", amHigh:[5,0,4.4], pmHigh:[9,2,3.4], amLow:null, pmLow:[1,16,0.6], rise:"7:28 AM",set:"7:15 PM",riseH:7.467,setH:19.250,dayLen:"11h 47m",moon:"waxing-gibbous" },
  { day:12, dow:"Thu", amHigh:[6,9,4.3], pmHigh:[9,42,3.6], amLow:[1,12,3.2], pmLow:[2,22,0.4], rise:"7:26 AM",set:"7:16 PM",riseH:7.433,setH:19.267,dayLen:"11h 50m",moon:"waxing-gibbous" },
  { day:13, dow:"Fri", amHigh:[7,19,4.4], pmHigh:[10,11,3.7], amLow:[2,25,3.0], pmLow:[3,14,0.2], rise:"7:25 AM",set:"7:17 PM",riseH:7.417,setH:19.283,dayLen:"11h 52m",moon:"full" },
  { day:14, dow:"Sat", amHigh:[8,21,4.5], pmHigh:[10,36,3.9], amLow:[3,18,2.7], pmLow:[3,56,0.0], rise:"7:23 AM",set:"7:18 PM",riseH:7.383,setH:19.300,dayLen:"11h 55m",moon:"full" },
  { day:15, dow:"Sun", amHigh:[9,14,4.7], pmHigh:[11,0,4.1], amLow:[4,0,2.3], pmLow:[4,32,-0.2], rise:"7:22 AM",set:"7:19 PM",riseH:7.367,setH:19.317,dayLen:"11h 57m",moon:"full" },
  { day:16, dow:"Mon", amHigh:[10,3,4.8], pmHigh:[11,23,4.3], amLow:[4,38,1.9], pmLow:[5,5,-0.2], rise:"7:20 AM",set:"7:20 PM",riseH:7.333,setH:19.333,dayLen:"12h 0m",moon:"full" },
  { day:17, dow:"Tue", amHigh:[10,50,4.8], pmHigh:[11,48,4.5], amLow:[5,15,1.5], pmLow:[5,37,-0.1], rise:"7:19 AM",set:"7:21 PM",riseH:7.317,setH:19.350,dayLen:"12h 2m",moon:"waning-gibbous" },
  { day:18, dow:"Wed", amHigh:[11,38,4.8], pmHigh:null, amLow:[5,54,1.0], pmLow:[6,8,0.2], rise:"7:17 AM",set:"7:21 PM",riseH:7.283,setH:19.350,dayLen:"12h 4m",moon:"waning-gibbous" },
  { day:19, dow:"Thu", amHigh:[0,14,4.8], pmHigh:[12,28,4.6], amLow:[6,34,0.5], pmLow:[6,41,0.6], rise:"7:16 AM",set:"7:22 PM",riseH:7.267,setH:19.367,dayLen:"12h 6m",moon:"waning-gibbous" },
  { day:20, dow:"Fri", amHigh:[0,42,5.1], pmHigh:[1,20,4.4], amLow:[7,17,0.1], pmLow:[7,16,1.0], rise:"7:14 AM",set:"7:23 PM",riseH:7.233,setH:19.383,dayLen:"12h 9m",moon:"waning-gibbous" },
  { day:21, dow:"Sat", amHigh:[1,13,5.3], pmHigh:[2,18,4.1], amLow:[8,3,-0.3], pmLow:[7,53,1.6], rise:"7:13 AM",set:"7:24 PM",riseH:7.217,setH:19.400,dayLen:"12h 11m",moon:"third-quarter" },
  { day:22, dow:"Sun", amHigh:[1,48,5.4], pmHigh:[3,23,3.8], amLow:[8,54,-0.4], pmLow:[8,35,2.1], rise:"7:11 AM",set:"7:25 PM",riseH:7.183,setH:19.417,dayLen:"12h 14m",moon:"third-quarter" },
  { day:23, dow:"Mon", amHigh:[2,28,5.4], pmHigh:[4,41,3.6], amLow:[9,52,-0.4], pmLow:[9,25,2.6], rise:"7:10 AM",set:"7:26 PM",riseH:7.167,setH:19.433,dayLen:"12h 16m",moon:"third-quarter" },
  { day:24, dow:"Tue", amHigh:[3,18,5.2], pmHigh:[6,11,3.5], amLow:[11,0,-0.3], pmLow:[10,35,2.9], rise:"7:08 AM",set:"7:27 PM",riseH:7.133,setH:19.450,dayLen:"12h 19m",moon:"waning-crescent" },
  { day:25, dow:"Wed", amHigh:[4,20,5.0], pmHigh:[7,38,3.6], amLow:null, pmLow:[12,18,-0.3], rise:"7:06 AM",set:"7:28 PM",riseH:7.100,setH:19.467,dayLen:"12h 22m",moon:"waning-crescent" },
  { day:26, dow:"Thu", amHigh:[5,36,4.8], pmHigh:[8,41,3.9], amLow:[0,12,3.0], pmLow:[1,35,-0.3], rise:"7:05 AM",set:"7:29 PM",riseH:7.083,setH:19.483,dayLen:"12h 24m",moon:"waning-crescent" },
  { day:27, dow:"Fri", amHigh:[6,57,4.7], pmHigh:[9,27,4.1], amLow:[1,45,2.7], pmLow:[2,41,-0.3], rise:"7:03 AM",set:"7:30 PM",riseH:7.050,setH:19.500,dayLen:"12h 27m",moon:"waning-crescent" },
  { day:28, dow:"Sat", amHigh:[8,11,4.7], pmHigh:[10,6,4.4], amLow:[2,56,2.3], pmLow:[3,34,-0.3], rise:"7:02 AM",set:"7:31 PM",riseH:7.033,setH:19.517,dayLen:"12h 29m",moon:"new" },
  { day:29, dow:"Sun", amHigh:[9,16,4.7], pmHigh:[10,40,4.6], amLow:[3,53,1.7], pmLow:[4,18,-0.2], rise:"7:00 AM",set:"7:32 PM",riseH:7.000,setH:19.533,dayLen:"12h 32m",moon:"new" },
  { day:30, dow:"Mon", amHigh:[10,13,4.6], pmHigh:[11,11,4.7], amLow:[4,42,1.2], pmLow:[4,57,0.0], rise:"6:59 AM",set:"7:33 PM",riseH:6.983,setH:19.550,dayLen:"12h 34m",moon:"waxing-crescent" },
  { day:31, dow:"Tue", amHigh:[11,6,4.5], pmHigh:[11,39,4.9], amLow:[5,26,0.8], pmLow:[5,31,0.3], rise:"6:57 AM",set:"7:34 PM",riseH:6.950,setH:19.567,dayLen:"12h 37m",moon:"waxing-crescent" },
];

const APR_DATA = [
  { day:1, dow:"Wed", amHigh:[11,55,4.3], pmHigh:null, amLow:[6,7,0.4], pmLow:[6,4,0.8], rise:"6:56 AM",set:"7:35 PM",riseH:6.933,setH:19.583,dayLen:"12h 39m",moon:"waxing-crescent" },
  { day:2, dow:"Thu", amHigh:[0,5,4.9], pmHigh:[12,43,4.2], amLow:[6,45,0.1], pmLow:[6,36,1.2], rise:"6:54 AM",set:"7:36 PM",riseH:6.9,setH:19.6,dayLen:"12h 42m",moon:"waxing-crescent" },
  { day:3, dow:"Fri", amHigh:[0,30,4.9], pmHigh:[1,31,4.0], amLow:[7,22,0.0], pmLow:[7,8,1.7], rise:"6:53 AM",set:"7:37 PM",riseH:6.883,setH:19.617,dayLen:"12h 44m",moon:"waxing-crescent" },
  { day:4, dow:"Sat", amHigh:[0,55,4.9], pmHigh:[2,20,3.8], amLow:[7,58,-0.1], pmLow:[7,41,2.1], rise:"6:51 AM",set:"7:37 PM",riseH:6.85,setH:19.617,dayLen:"12h 46m",moon:"waxing-crescent" },
  { day:5, dow:"Sun", amHigh:[1,21,4.9], pmHigh:[3,12,3.6], amLow:[8,37,-0.1], pmLow:[8,15,2.5], rise:"6:50 AM",set:"7:38 PM",riseH:6.833,setH:19.633,dayLen:"12h 48m",moon:"first-quarter" },
  { day:6, dow:"Mon", amHigh:[1,51,4.7], pmHigh:[4,13,3.4], amLow:[9,19,0.0], pmLow:[8,53,2.8], rise:"6:48 AM",set:"7:39 PM",riseH:6.8,setH:19.65,dayLen:"12h 51m",moon:"first-quarter" },
  { day:7, dow:"Tue", amHigh:[2,27,4.6], pmHigh:[5,28,3.3], amLow:[10,8,0.2], pmLow:[9,43,3.0], rise:"6:47 AM",set:"7:40 PM",riseH:6.783,setH:19.667,dayLen:"12h 53m",moon:"waxing-gibbous" },
  { day:8, dow:"Wed", amHigh:[3,12,4.4], pmHigh:[6,53,3.3], amLow:[11,7,0.3], pmLow:[11,5,3.2], rise:"6:45 AM",set:"7:41 PM",riseH:6.75,setH:19.683,dayLen:"12h 56m",moon:"waxing-gibbous" },
  { day:9, dow:"Thu", amHigh:[4,10,4.2], pmHigh:[7,58,3.4], amLow:null, pmLow:[12,14,0.4], rise:"6:44 AM",set:"7:42 PM",riseH:6.733,setH:19.7,dayLen:"12h 58m",moon:"waxing-gibbous" },
  { day:10, dow:"Fri", amHigh:[5,21,4.0], pmHigh:[8,38,3.6], amLow:[0,45,3.1], pmLow:[1,19,0.3], rise:"6:42 AM",set:"7:43 PM",riseH:6.7,setH:19.717,dayLen:"13h 1m",moon:"waxing-gibbous" },
  { day:11, dow:"Sat", amHigh:[6,36,4.0], pmHigh:[9,8,3.8], amLow:[1,57,2.8], pmLow:[2,14,0.2], rise:"6:41 AM",set:"7:44 PM",riseH:6.683,setH:19.733,dayLen:"13h 3m",moon:"waxing-gibbous" },
  { day:12, dow:"Sun", amHigh:[7,45,4.0], pmHigh:[9,33,4.0], amLow:[2,50,2.3], pmLow:[2,59,0.2], rise:"6:39 AM",set:"7:45 PM",riseH:6.65,setH:19.75,dayLen:"13h 6m",moon:"waxing-gibbous" },
  { day:13, dow:"Mon", amHigh:[8,47,4.1], pmHigh:[9,58,4.3], amLow:[3,33,1.8], pmLow:[3,38,0.2], rise:"6:38 AM",set:"7:46 PM",riseH:6.633,setH:19.767,dayLen:"13h 8m",moon:"full" },
  { day:14, dow:"Tue", amHigh:[9,45,4.2], pmHigh:[10,24,4.6], amLow:[4,13,1.2], pmLow:[4,15,0.4], rise:"6:36 AM",set:"7:47 PM",riseH:6.6,setH:19.783,dayLen:"13h 11m",moon:"full" },
  { day:15, dow:"Wed", amHigh:[10,41,4.3], pmHigh:[10,52,4.9], amLow:[4,53,0.6], pmLow:[4,51,0.7], rise:"6:35 AM",set:"7:48 PM",riseH:6.583,setH:19.8,dayLen:"13h 13m",moon:"waning-gibbous" },
  { day:16, dow:"Thu", amHigh:[11,36,4.3], pmHigh:[11,22,5.2], amLow:[5,33,0.0], pmLow:[5,28,1.0], rise:"6:34 AM",set:"7:49 PM",riseH:6.567,setH:19.817,dayLen:"13h 15m",moon:"waning-gibbous" },
  { day:17, dow:"Fri", amHigh:null, pmHigh:[12,32,4.2], amLow:[6,16,-0.6], pmLow:[6,7,1.5], rise:"6:32 AM",set:"7:50 PM",riseH:6.533,setH:19.833,dayLen:"13h 18m",moon:"waning-gibbous" },
  { day:18, dow:"Sat", amHigh:null, pmHigh:[1,30,4.2], amLow:[7,1,-1.0], pmLow:[6,47,1.9], rise:"6:31 AM",set:"7:51 PM",riseH:6.517,setH:19.85,dayLen:"13h 20m",moon:"waning-gibbous" },
  { day:19, dow:"Sun", amHigh:[0,32,5.6], pmHigh:[2,31,4.0], amLow:[7,49,-1.2], pmLow:[7,32,2.3], rise:"6:29 AM",set:"7:51 PM",riseH:6.483,setH:19.85,dayLen:"13h 22m",moon:"waning-gibbous" },
  { day:20, dow:"Mon", amHigh:[1,14,5.6], pmHigh:[3,36,3.9], amLow:[8,42,-1.2], pmLow:[8,23,2.6], rise:"6:28 AM",set:"7:52 PM",riseH:6.467,setH:19.867,dayLen:"13h 24m",moon:"third-quarter" },
  { day:21, dow:"Tue", amHigh:[2,3,5.5], pmHigh:[4,46,3.8], amLow:[9,40,-1.1], pmLow:[9,26,2.8], rise:"6:27 AM",set:"7:53 PM",riseH:6.45,setH:19.883,dayLen:"13h 26m",moon:"third-quarter" },
  { day:22, dow:"Wed", amHigh:[2,59,5.2], pmHigh:[5,58,3.8], amLow:[10,44,-0.8], pmLow:[10,50,2.9], rise:"6:25 AM",set:"7:54 PM",riseH:6.417,setH:19.9,dayLen:"13h 29m",moon:"waning-crescent" },
  { day:23, dow:"Thu", amHigh:[4,7,4.8], pmHigh:[7,4,4.0], amLow:[11,54,-0.5], pmLow:null, rise:"6:24 AM",set:"7:55 PM",riseH:6.4,setH:19.917,dayLen:"13h 31m",moon:"waning-crescent" },
  { day:24, dow:"Fri", amHigh:[5,24,4.4], pmHigh:[7,58,4.2], amLow:[0,25,2.7], pmLow:[1,3,-0.3], rise:"6:23 AM",set:"7:56 PM",riseH:6.383,setH:19.933,dayLen:"13h 33m",moon:"waning-crescent" },
  { day:25, dow:"Sat", amHigh:[6,46,4.2], pmHigh:[8,43,4.4], amLow:[1,46,2.2], pmLow:[2,3,-0.1], rise:"6:22 AM",set:"7:57 PM",riseH:6.367,setH:19.95,dayLen:"13h 35m",moon:"waning-crescent" },
  { day:26, dow:"Sun", amHigh:[8,3,4.0], pmHigh:[9,20,4.6], amLow:[2,52,1.6], pmLow:[2,54,0.2], rise:"6:20 AM",set:"7:58 PM",riseH:6.333,setH:19.967,dayLen:"13h 38m",moon:"waning-crescent" },
  { day:27, dow:"Mon", amHigh:[9,12,3.9], pmHigh:[9,54,4.8], amLow:[3,46,1.1], pmLow:[3,38,0.5], rise:"6:19 AM",set:"7:59 PM",riseH:6.317,setH:19.983,dayLen:"13h 40m",moon:"new" },
  { day:28, dow:"Tue", amHigh:[10,14,3.9], pmHigh:[10,23,5.0], amLow:[4,33,0.5], pmLow:[4,17,0.9], rise:"6:18 AM",set:"8:00 PM",riseH:6.3,setH:20.0,dayLen:"13h 42m",moon:"new" },
  { day:29, dow:"Wed", amHigh:[11,10,3.9], pmHigh:[10,51,5.0], amLow:[5,14,0.1], pmLow:[4,53,1.3], rise:"6:17 AM",set:"8:01 PM",riseH:6.283,setH:20.017,dayLen:"13h 44m",moon:"waxing-crescent" },
  { day:30, dow:"Thu", amHigh:[12,2,3.8], pmHigh:null, amLow:[5,52,-0.2], pmLow:[5,28,1.7], rise:"6:15 AM",set:"8:02 PM",riseH:6.25,setH:20.033,dayLen:"13h 47m",moon:"waxing-crescent" },
];

const MAY_DATA = [
  { day:1, dow:"Fri", amHigh:null, pmHigh:[12,51,3.8], amLow:[6,27,-0.4], pmLow:[6,3,2.1], rise:"6:14 AM",set:"8:03 PM",riseH:6.233,setH:20.05,dayLen:"13h 49m",moon:"waxing-crescent" },
  { day:2, dow:"Sat", amHigh:null, pmHigh:[1,38,3.8], amLow:[7,0,-0.5], pmLow:[6,37,2.4], rise:"6:13 AM",set:"8:04 PM",riseH:6.217,setH:20.067,dayLen:"13h 51m",moon:"waxing-crescent" },
  { day:3, dow:"Sun", amHigh:[0,9,5.0], pmHigh:[2,25,3.7], amLow:[7,35,-0.6], pmLow:[7,13,2.7], rise:"6:12 AM",set:"8:05 PM",riseH:6.2,setH:20.083,dayLen:"13h 53m",moon:"waxing-crescent" },
  { day:4, dow:"Mon", amHigh:[0,39,4.9], pmHigh:[3,13,3.6], amLow:[8,11,-0.5], pmLow:[7,50,2.9], rise:"6:11 AM",set:"8:06 PM",riseH:6.183,setH:20.1,dayLen:"13h 55m",moon:"waxing-crescent" },
  { day:5, dow:"Tue", amHigh:[1,13,4.8], pmHigh:[4,4,3.6], amLow:[8,51,-0.4], pmLow:[8,33,3.0], rise:"6:10 AM",set:"8:06 PM",riseH:6.167,setH:20.1,dayLen:"13h 56m",moon:"first-quarter" },
  { day:6, dow:"Wed", amHigh:[1,52,4.6], pmHigh:[4,58,3.5], amLow:[9,35,-0.3], pmLow:[9,26,3.1], rise:"6:09 AM",set:"8:07 PM",riseH:6.15,setH:20.117,dayLen:"13h 58m",moon:"first-quarter" },
  { day:7, dow:"Thu", amHigh:[2,38,4.4], pmHigh:[5,54,3.5], amLow:[10,25,-0.1], pmLow:[10,40,3.1], rise:"6:08 AM",set:"8:08 PM",riseH:6.133,setH:20.133,dayLen:"14h 0m",moon:"waxing-gibbous" },
  { day:8, dow:"Fri", amHigh:[3,32,4.1], pmHigh:[6,43,3.6], amLow:[11,19,0.0], pmLow:null, rise:"6:07 AM",set:"8:09 PM",riseH:6.117,setH:20.15,dayLen:"14h 2m",moon:"waxing-gibbous" },
  { day:9, dow:"Sat", amHigh:[4,36,3.9], pmHigh:[7,22,3.8], amLow:[0,5,2.9], pmLow:[12,14,0.1], rise:"6:06 AM",set:"8:10 PM",riseH:6.1,setH:20.167,dayLen:"14h 4m",moon:"waxing-gibbous" },
  { day:10, dow:"Sun", amHigh:[5,50,3.7], pmHigh:[7,55,4.1], amLow:[1,18,2.5], pmLow:[1,6,0.3], rise:"6:05 AM",set:"8:11 PM",riseH:6.083,setH:20.183,dayLen:"14h 6m",moon:"waxing-gibbous" },
  { day:11, dow:"Mon", amHigh:[7,8,3.6], pmHigh:[8,26,4.4], amLow:[2,15,2.0], pmLow:[1,55,0.5], rise:"6:04 AM",set:"8:12 PM",riseH:6.067,setH:20.2,dayLen:"14h 8m",moon:"waxing-gibbous" },
  { day:12, dow:"Tue", amHigh:[8,24,3.6], pmHigh:[8,56,4.7], amLow:[3,3,1.3], pmLow:[2,40,0.8], rise:"6:03 AM",set:"8:13 PM",riseH:6.05,setH:20.217,dayLen:"14h 10m",moon:"full" },
  { day:13, dow:"Wed", amHigh:[9,34,3.7], pmHigh:[9,27,5.1], amLow:[3,47,0.6], pmLow:[3,23,1.1], rise:"6:02 AM",set:"8:14 PM",riseH:6.033,setH:20.233,dayLen:"14h 12m",moon:"full" },
  { day:14, dow:"Thu", amHigh:[10,39,3.8], pmHigh:[10,1,5.4], amLow:[4,30,-0.2], pmLow:[4,6,1.5], rise:"6:01 AM",set:"8:15 PM",riseH:6.017,setH:20.25,dayLen:"14h 14m",moon:"waning-gibbous" },
  { day:15, dow:"Fri", amHigh:[11,41,4.0], pmHigh:[10,38,5.7], amLow:[5,14,-0.8], pmLow:[4,51,1.9], rise:"6:00 AM",set:"8:16 PM",riseH:6.0,setH:20.267,dayLen:"14h 16m",moon:"waning-gibbous" },
  { day:16, dow:"Sat", amHigh:null, pmHigh:[12,40,4.1], amLow:[6,0,-1.3], pmLow:[5,37,2.3], rise:"5:59 AM",set:"8:16 PM",riseH:5.983,setH:20.267,dayLen:"14h 17m",moon:"waning-gibbous" },
  { day:17, dow:"Sun", amHigh:null, pmHigh:[1,38,4.1], amLow:[6,48,-1.6], pmLow:[6,26,2.5], rise:"5:58 AM",set:"8:17 PM",riseH:5.967,setH:20.283,dayLen:"14h 19m",moon:"waning-gibbous" },
  { day:18, dow:"Mon", amHigh:[0,5,5.9], pmHigh:[2,35,4.1], amLow:[7,38,-1.7], pmLow:[7,19,2.7], rise:"5:58 AM",set:"8:18 PM",riseH:5.967,setH:20.3,dayLen:"14h 20m",moon:"waning-gibbous" },
  { day:19, dow:"Tue", amHigh:[0,55,5.8], pmHigh:[3,32,4.1], amLow:[8,31,-1.6], pmLow:[8,19,2.8], rise:"5:57 AM",set:"8:19 PM",riseH:5.95,setH:20.317,dayLen:"14h 22m",moon:"waning-gibbous" },
  { day:20, dow:"Wed", amHigh:[1,49,5.5], pmHigh:[4,30,4.1], amLow:[9,27,-1.3], pmLow:[9,29,2.8], rise:"5:56 AM",set:"8:20 PM",riseH:5.933,setH:20.333,dayLen:"14h 24m",moon:"third-quarter" },
  { day:21, dow:"Thu", amHigh:[2,48,5.1], pmHigh:[5,26,4.2], amLow:[10,24,-1.0], pmLow:[10,51,2.6], rise:"5:55 AM",set:"8:21 PM",riseH:5.917,setH:20.35,dayLen:"14h 26m",moon:"waning-crescent" },
  { day:22, dow:"Fri", amHigh:[3,54,4.6], pmHigh:[6,20,4.3], amLow:[11,23,-0.5], pmLow:null, rise:"5:55 AM",set:"8:22 PM",riseH:5.917,setH:20.367,dayLen:"14h 27m",moon:"waning-crescent" },
  { day:23, dow:"Sat", amHigh:[5,8,4.1], pmHigh:[7,9,4.5], amLow:[0,16,2.3], pmLow:[12,21,-0.1], rise:"5:54 AM",set:"8:22 PM",riseH:5.9,setH:20.367,dayLen:"14h 28m",moon:"waning-crescent" },
  { day:24, dow:"Sun", amHigh:[6,29,3.7], pmHigh:[7,52,4.7], amLow:[1,32,1.7], pmLow:[1,15,0.4], rise:"5:53 AM",set:"8:23 PM",riseH:5.883,setH:20.383,dayLen:"14h 30m",moon:"waning-crescent" },
  { day:25, dow:"Mon", amHigh:[7,53,3.4], pmHigh:[8,30,4.9], amLow:[2,37,1.2], pmLow:[2,6,0.9], rise:"5:53 AM",set:"8:24 PM",riseH:5.883,setH:20.4,dayLen:"14h 31m",moon:"waning-crescent" },
  { day:26, dow:"Tue", amHigh:[9,11,3.4], pmHigh:[9,4,5.1], amLow:[3,31,0.6], pmLow:[2,52,1.4], rise:"5:52 AM",set:"8:25 PM",riseH:5.867,setH:20.417,dayLen:"14h 33m",moon:"waning-crescent" },
  { day:27, dow:"Wed", amHigh:[10,19,3.5], pmHigh:[9,36,5.2], amLow:[4,17,0.1], pmLow:[3,36,1.8], rise:"5:52 AM",set:"8:25 PM",riseH:5.867,setH:20.417,dayLen:"14h 33m",moon:"new" },
  { day:28, dow:"Thu", amHigh:[11,18,3.6], pmHigh:[10,6,5.2], amLow:[4,58,-0.2], pmLow:[4,18,2.2], rise:"5:51 AM",set:"8:26 PM",riseH:5.85,setH:20.433,dayLen:"14h 35m",moon:"new" },
  { day:29, dow:"Fri", amHigh:null, pmHigh:[12,11,3.7], amLow:[5,35,-0.5], pmLow:[4,58,2.5], rise:"5:51 AM",set:"8:27 PM",riseH:5.85,setH:20.45,dayLen:"14h 36m",moon:"waxing-crescent" },
  { day:30, dow:"Sat", amHigh:null, pmHigh:[12,58,3.8], amLow:[6,9,-0.6], pmLow:[5,37,2.8], rise:"5:50 AM",set:"8:28 PM",riseH:5.833,setH:20.467,dayLen:"14h 38m",moon:"waxing-crescent" },
  { day:31, dow:"Sun", amHigh:null, pmHigh:[1,41,3.8], amLow:[6,43,-0.7], pmLow:[6,15,2.9], rise:"5:50 AM",set:"8:28 PM",riseH:5.833,setH:20.467,dayLen:"14h 38m",moon:"waxing-crescent" },
];

const JUN_DATA = [
  { day:1, dow:"Mon", amHigh:null, pmHigh:[2,21,3.8], amLow:[7,17,-0.7], pmLow:[6,54,3.0], rise:"5:50 AM",set:"8:29 PM",riseH:5.833,setH:20.483,dayLen:"14h 39m",moon:"waxing-crescent" },
  { day:2, dow:"Tue", amHigh:[0,14,5.0], pmHigh:[3,0,3.8], amLow:[7,53,-0.7], pmLow:[7,33,3.1], rise:"5:49 AM",set:"8:30 PM",riseH:5.817,setH:20.5,dayLen:"14h 41m",moon:"waxing-crescent" },
  { day:3, dow:"Wed", amHigh:[0,51,4.9], pmHigh:[3,39,3.8], amLow:[8,29,-0.6], pmLow:[8,17,3.1], rise:"5:49 AM",set:"8:30 PM",riseH:5.817,setH:20.5,dayLen:"14h 41m",moon:"first-quarter" },
  { day:4, dow:"Thu", amHigh:[1,30,4.7], pmHigh:[4,18,3.8], amLow:[9,8,-0.5], pmLow:[9,7,3.0], rise:"5:49 AM",set:"8:31 PM",riseH:5.817,setH:20.517,dayLen:"14h 42m",moon:"first-quarter" },
  { day:5, dow:"Fri", amHigh:[2,13,4.5], pmHigh:[4,57,3.9], amLow:[9,49,-0.4], pmLow:[10,9,2.9], rise:"5:48 AM",set:"8:32 PM",riseH:5.8,setH:20.533,dayLen:"14h 44m",moon:"waxing-gibbous" },
  { day:6, dow:"Sat", amHigh:[3,2,4.2], pmHigh:[5,34,4.0], amLow:[10,31,-0.1], pmLow:[11,21,2.7], rise:"5:48 AM",set:"8:32 PM",riseH:5.8,setH:20.533,dayLen:"14h 44m",moon:"waxing-gibbous" },
  { day:7, dow:"Sun", amHigh:[4,1,3.8], pmHigh:[6,11,4.2], amLow:[11,16,0.2], pmLow:null, rise:"5:48 AM",set:"8:33 PM",riseH:5.8,setH:20.55,dayLen:"14h 45m",moon:"waxing-gibbous" },
  { day:8, dow:"Mon", amHigh:[5,14,3.5], pmHigh:[6,46,4.5], amLow:[0,32,2.2], pmLow:[12,4,0.6], rise:"5:48 AM",set:"8:33 PM",riseH:5.8,setH:20.55,dayLen:"14h 45m",moon:"waxing-gibbous" },
  { day:9, dow:"Tue", amHigh:[6,41,3.3], pmHigh:[7,22,4.8], amLow:[1,36,1.6], pmLow:[12,53,1.1], rise:"5:48 AM",set:"8:34 PM",riseH:5.8,setH:20.567,dayLen:"14h 46m",moon:"waxing-gibbous" },
  { day:10, dow:"Wed", amHigh:[8,12,3.2], pmHigh:[7,59,5.2], amLow:[2,31,0.9], pmLow:[1,44,1.5], rise:"5:48 AM",set:"8:34 PM",riseH:5.8,setH:20.567,dayLen:"14h 46m",moon:"waxing-gibbous" },
  { day:11, dow:"Thu", amHigh:[9,34,3.4], pmHigh:[8,39,5.6], amLow:[3,22,0.1], pmLow:[2,37,2.0], rise:"5:48 AM",set:"8:35 PM",riseH:5.8,setH:20.583,dayLen:"14h 47m",moon:"full" },
  { day:12, dow:"Fri", amHigh:[10,45,3.7], pmHigh:[9,22,5.9], amLow:[4,10,-0.6], pmLow:[3,29,2.4], rise:"5:47 AM",set:"8:35 PM",riseH:5.783,setH:20.583,dayLen:"14h 48m",moon:"full" },
  { day:13, dow:"Sat", amHigh:[11,46,3.9], pmHigh:[10,8,6.1], amLow:[4,59,-1.1], pmLow:[4,23,2.6], rise:"5:47 AM",set:"8:36 PM",riseH:5.783,setH:20.6,dayLen:"14h 49m",moon:"waning-gibbous" },
  { day:14, dow:"Sun", amHigh:null, pmHigh:[12,42,4.1], amLow:[5,48,-1.5], pmLow:[5,17,2.7], rise:"5:48 AM",set:"8:36 PM",riseH:5.8,setH:20.6,dayLen:"14h 48m",moon:"waning-gibbous" },
  { day:15, dow:"Mon", amHigh:null, pmHigh:[1,33,4.2], amLow:[6,38,-1.7], pmLow:[6,13,2.8], rise:"5:48 AM",set:"8:36 PM",riseH:5.8,setH:20.6,dayLen:"14h 48m",moon:"waning-gibbous" },
  { day:16, dow:"Tue", amHigh:null, pmHigh:[2,22,4.3], amLow:[7,28,-1.7], pmLow:[7,11,2.7], rise:"5:48 AM",set:"8:37 PM",riseH:5.8,setH:20.617,dayLen:"14h 49m",moon:"waning-gibbous" },
  { day:17, dow:"Wed", amHigh:[0,44,5.9], pmHigh:[3,10,4.4], amLow:[8,18,-1.6], pmLow:[8,13,2.6], rise:"5:48 AM",set:"8:37 PM",riseH:5.8,setH:20.617,dayLen:"14h 49m",moon:"waning-gibbous" },
  { day:18, dow:"Thu", amHigh:[1,39,5.6], pmHigh:[3,57,4.5], amLow:[9,7,-1.2], pmLow:[9,21,2.4], rise:"5:48 AM",set:"8:37 PM",riseH:5.8,setH:20.617,dayLen:"14h 49m",moon:"third-quarter" },
  { day:19, dow:"Fri", amHigh:[2,36,5.0], pmHigh:[4,43,4.6], amLow:[9,56,-0.8], pmLow:[10,35,2.2], rise:"5:48 AM",set:"8:38 PM",riseH:5.8,setH:20.633,dayLen:"14h 50m",moon:"third-quarter" },
  { day:20, dow:"Sat", amHigh:[3,38,4.4], pmHigh:[5,29,4.7], amLow:[10,44,-0.2], pmLow:[11,51,1.9], rise:"5:48 AM",set:"8:38 PM",riseH:5.8,setH:20.633,dayLen:"14h 50m",moon:"waning-crescent" },
  { day:21, dow:"Sun", amHigh:[4,48,3.8], pmHigh:[6,13,4.9], amLow:[11,34,0.5], pmLow:null, rise:"5:48 AM",set:"8:38 PM",riseH:5.8,setH:20.633,dayLen:"14h 50m",moon:"waning-crescent" },
  { day:22, dow:"Mon", amHigh:[6,12,3.4], pmHigh:[6,56,5.0], amLow:[1,5,1.4], pmLow:[12,24,1.1], rise:"5:49 AM",set:"8:38 PM",riseH:5.817,setH:20.633,dayLen:"14h 49m",moon:"waning-crescent" },
  { day:23, dow:"Tue", amHigh:[7,45,3.2], pmHigh:[7,36,5.1], amLow:[2,11,1.0], pmLow:[1,17,1.7], rise:"5:49 AM",set:"8:39 PM",riseH:5.817,setH:20.65,dayLen:"14h 50m",moon:"waning-crescent" },
  { day:24, dow:"Wed", amHigh:[9,14,3.2], pmHigh:[8,15,5.2], amLow:[3,7,0.5], pmLow:[2,10,2.2], rise:"5:49 AM",set:"8:39 PM",riseH:5.817,setH:20.65,dayLen:"14h 50m",moon:"waning-crescent" },
  { day:25, dow:"Thu", amHigh:[10,26,3.5], pmHigh:[8,52,5.2], amLow:[3,56,0.1], pmLow:[3,3,2.6], rise:"5:50 AM",set:"8:39 PM",riseH:5.833,setH:20.65,dayLen:"14h 49m",moon:"waning-crescent" },
  { day:26, dow:"Fri", amHigh:[11,23,3.7], pmHigh:[9,29,5.3], amLow:[4,38,-0.2], pmLow:[3,52,2.9], rise:"5:50 AM",set:"8:39 PM",riseH:5.833,setH:20.65,dayLen:"14h 49m",moon:"new" },
  { day:27, dow:"Sat", amHigh:null, pmHigh:[12,10,3.8], amLow:[5,17,-0.4], pmLow:[4,38,3.0], rise:"5:50 AM",set:"8:39 PM",riseH:5.833,setH:20.65,dayLen:"14h 49m",moon:"waxing-crescent" },
  { day:28, dow:"Sun", amHigh:null, pmHigh:[12,50,3.9], amLow:[5,53,-0.5], pmLow:[5,20,3.1], rise:"5:51 AM",set:"8:39 PM",riseH:5.85,setH:20.65,dayLen:"14h 48m",moon:"waxing-crescent" },
  { day:29, dow:"Mon", amHigh:null, pmHigh:[1,25,4.0], amLow:[6,27,-0.6], pmLow:[6,0,3.1], rise:"5:51 AM",set:"8:39 PM",riseH:5.85,setH:20.65,dayLen:"14h 48m",moon:"waxing-crescent" },
  { day:30, dow:"Tue", amHigh:null, pmHigh:[1,58,4.0], amLow:[7,1,-0.6], pmLow:[6,38,3.0], rise:"5:52 AM",set:"8:39 PM",riseH:5.867,setH:20.65,dayLen:"14h 47m",moon:"waxing-crescent" },
];

const JUL_DATA = [
  { day:1, dow:"Wed", amHigh:null, pmHigh:[2,29,4.0], amLow:[7,33,-0.6], pmLow:[7,16,2.9], rise:"5:52 AM",set:"8:39 PM",riseH:5.867,setH:20.65,dayLen:"14h 47m",moon:"waxing-crescent" },
  { day:2, dow:"Thu", amHigh:[0,36,5.1], pmHigh:[2,59,4.0], amLow:[8,6,-0.6], pmLow:[7,58,2.8], rise:"5:53 AM",set:"8:39 PM",riseH:5.883,setH:20.65,dayLen:"14h 46m",moon:"waxing-crescent" },
  { day:3, dow:"Fri", amHigh:[1,14,4.9], pmHigh:[3,29,4.1], amLow:[8,38,-0.5], pmLow:[8,44,2.7], rise:"5:53 AM",set:"8:38 PM",riseH:5.883,setH:20.633,dayLen:"14h 45m",moon:"first-quarter" },
  { day:4, dow:"Sat", amHigh:[1,56,4.6], pmHigh:[4,0,4.3], amLow:[9,12,-0.2], pmLow:[9,38,2.5], rise:"5:54 AM",set:"8:38 PM",riseH:5.9,setH:20.633,dayLen:"14h 44m",moon:"first-quarter" },
  { day:5, dow:"Sun", amHigh:[2,43,4.2], pmHigh:[4,32,4.5], amLow:[9,48,0.1], pmLow:[10,40,2.2], rise:"5:54 AM",set:"8:38 PM",riseH:5.9,setH:20.633,dayLen:"14h 44m",moon:"waxing-gibbous" },
  { day:6, dow:"Mon", amHigh:[3,41,3.8], pmHigh:[5,7,4.7], amLow:[10,27,0.6], pmLow:[11,48,1.8], rise:"5:55 AM",set:"8:38 PM",riseH:5.917,setH:20.633,dayLen:"14h 43m",moon:"waxing-gibbous" },
  { day:7, dow:"Tue", amHigh:[4,57,3.4], pmHigh:[5,44,5.0], amLow:[11,11,1.2], pmLow:null, rise:"5:55 AM",set:"8:38 PM",riseH:5.917,setH:20.633,dayLen:"14h 43m",moon:"waxing-gibbous" },
  { day:8, dow:"Wed", amHigh:[6,34,3.2], pmHigh:[6,26,5.3], amLow:[0,56,1.2], pmLow:[12,2,1.8], rise:"5:56 AM",set:"8:37 PM",riseH:5.933,setH:20.617,dayLen:"14h 41m",moon:"waxing-gibbous" },
  { day:9, dow:"Thu", amHigh:[8,17,3.2], pmHigh:[7,13,5.6], amLow:[2,1,0.6], pmLow:[1,1,2.3], rise:"5:57 AM",set:"8:37 PM",riseH:5.95,setH:20.617,dayLen:"14h 40m",moon:"waxing-gibbous" },
  { day:10, dow:"Fri", amHigh:[9,43,3.5], pmHigh:[8,5,5.8], amLow:[3,0,-0.1], pmLow:[2,5,2.7], rise:"5:57 AM",set:"8:37 PM",riseH:5.95,setH:20.617,dayLen:"14h 40m",moon:"full" },
  { day:11, dow:"Sat", amHigh:[10,49,3.8], pmHigh:[8,59,6.1], amLow:[3,55,-0.7], pmLow:[3,9,2.9], rise:"5:58 AM",set:"8:36 PM",riseH:5.967,setH:20.6,dayLen:"14h 38m",moon:"full" },
  { day:12, dow:"Sun", amHigh:[11,42,4.0], pmHigh:[9,54,6.2], amLow:[4,47,-1.1], pmLow:[4,10,2.9], rise:"5:58 AM",set:"8:36 PM",riseH:5.967,setH:20.6,dayLen:"14h 38m",moon:"waning-gibbous" },
  { day:13, dow:"Mon", amHigh:null, pmHigh:[12,29,4.2], amLow:[5,38,-1.4], pmLow:[5,9,2.8], rise:"5:59 AM",set:"8:35 PM",riseH:5.983,setH:20.583,dayLen:"14h 36m",moon:"waning-gibbous" },
  { day:14, dow:"Tue", amHigh:null, pmHigh:[1,12,4.4], amLow:[6,26,-1.5], pmLow:[6,6,2.6], rise:"6:00 AM",set:"8:35 PM",riseH:6.0,setH:20.583,dayLen:"14h 35m",moon:"waning-gibbous" },
  { day:15, dow:"Wed", amHigh:null, pmHigh:[1,53,4.5], amLow:[7,12,-1.4], pmLow:[7,3,2.4], rise:"6:01 AM",set:"8:34 PM",riseH:6.017,setH:20.567,dayLen:"14h 33m",moon:"waning-gibbous" },
  { day:16, dow:"Thu", amHigh:[0,36,5.9], pmHigh:[2,33,4.7], amLow:[7,56,-1.1], pmLow:[8,1,2.2], rise:"6:01 AM",set:"8:34 PM",riseH:6.017,setH:20.567,dayLen:"14h 33m",moon:"waning-gibbous" },
  { day:17, dow:"Fri", amHigh:[1,29,5.4], pmHigh:[3,13,4.8], amLow:[8,39,-0.7], pmLow:[9,2,1.9], rise:"6:02 AM",set:"8:33 PM",riseH:6.033,setH:20.55,dayLen:"14h 31m",moon:"waning-gibbous" },
  { day:18, dow:"Sat", amHigh:[2,23,4.9], pmHigh:[3,52,4.9], amLow:[9,20,-0.1], pmLow:[10,6,1.7], rise:"6:03 AM",set:"8:33 PM",riseH:6.05,setH:20.55,dayLen:"14h 30m",moon:"third-quarter" },
  { day:19, dow:"Sun", amHigh:[3,22,4.2], pmHigh:[4,32,5.0], amLow:[10,2,0.5], pmLow:[11,15,1.5], rise:"6:04 AM",set:"8:32 PM",riseH:6.067,setH:20.533,dayLen:"14h 28m",moon:"third-quarter" },
  { day:20, dow:"Mon", amHigh:[4,31,3.7], pmHigh:[5,12,5.0], amLow:[10,45,1.2], pmLow:null, rise:"6:04 AM",set:"8:31 PM",riseH:6.067,setH:20.517,dayLen:"14h 27m",moon:"waning-crescent" },
  { day:21, dow:"Tue", amHigh:[5,58,3.3], pmHigh:[5,55,5.1], amLow:[12,25,1.2], pmLow:[11,34,1.9], rise:"6:05 AM",set:"8:31 PM",riseH:6.083,setH:20.517,dayLen:"14h 26m",moon:"waning-crescent" },
  { day:22, dow:"Wed", amHigh:[7,43,3.2], pmHigh:[6,40,5.1], amLow:[1,33,0.9], pmLow:[12,33,2.5], rise:"6:06 AM",set:"8:30 PM",riseH:6.1,setH:20.5,dayLen:"14h 24m",moon:"waning-crescent" },
  { day:23, dow:"Thu", amHigh:[9,17,3.4], pmHigh:[7,28,5.1], amLow:[2,34,0.6], pmLow:[1,40,2.9], rise:"6:07 AM",set:"8:29 PM",riseH:6.117,setH:20.483,dayLen:"14h 22m",moon:"waning-crescent" },
  { day:24, dow:"Fri", amHigh:[10,22,3.7], pmHigh:[8,15,5.2], amLow:[3,28,0.3], pmLow:[2,44,3.1], rise:"6:08 AM",set:"8:28 PM",riseH:6.133,setH:20.467,dayLen:"14h 20m",moon:"waning-crescent" },
  { day:25, dow:"Sat", amHigh:[11,10,3.8], pmHigh:[9,2,5.2], amLow:[4,14,0.1], pmLow:[3,39,3.1], rise:"6:08 AM",set:"8:28 PM",riseH:6.133,setH:20.467,dayLen:"14h 20m",moon:"new" },
  { day:26, dow:"Sun", amHigh:[11,48,4.0], pmHigh:[9,45,5.3], amLow:[4,55,-0.1], pmLow:[4,25,3.1], rise:"6:09 AM",set:"8:27 PM",riseH:6.15,setH:20.45,dayLen:"14h 18m",moon:"new" },
  { day:27, dow:"Mon", amHigh:null, pmHigh:[12,20,4.0], amLow:[5,32,-0.2], pmLow:[5,6,3.0], rise:"6:10 AM",set:"8:26 PM",riseH:6.167,setH:20.433,dayLen:"14h 16m",moon:"waxing-crescent" },
  { day:28, dow:"Tue", amHigh:null, pmHigh:[12,49,4.1], amLow:[6,5,-0.4], pmLow:[5,43,2.8], rise:"6:11 AM",set:"8:25 PM",riseH:6.183,setH:20.417,dayLen:"14h 14m",moon:"waxing-crescent" },
  { day:29, dow:"Wed", amHigh:null, pmHigh:[1,15,4.1], amLow:[6,36,-0.4], pmLow:[6,20,2.7], rise:"6:12 AM",set:"8:24 PM",riseH:6.2,setH:20.4,dayLen:"14h 12m",moon:"waxing-crescent" },
  { day:30, dow:"Thu", amHigh:null, pmHigh:[1,41,4.2], amLow:[7,5,-0.4], pmLow:[6,57,2.5], rise:"6:13 AM",set:"8:23 PM",riseH:6.217,setH:20.383,dayLen:"14h 10m",moon:"waxing-crescent" },
  { day:31, dow:"Fri", amHigh:[0,23,5.1], pmHigh:[2,7,4.4], amLow:[7,35,-0.3], pmLow:[7,37,2.3], rise:"6:13 AM",set:"8:22 PM",riseH:6.217,setH:20.367,dayLen:"14h 9m",moon:"waxing-crescent" },
];

const AUG_DATA = [
  { day:1, dow:"Sat", amHigh:[1,3,4.9], pmHigh:[2,34,4.5], amLow:[8,4,-0.1], pmLow:[8,20,2.1], rise:"6:14 AM",set:"8:21 PM",riseH:6.233,setH:20.35,dayLen:"14h 7m",moon:"first-quarter" },
  { day:2, dow:"Sun", amHigh:[1,47,4.6], pmHigh:[3,2,4.7], amLow:[8,35,0.3], pmLow:[9,10,1.8], rise:"6:15 AM",set:"8:20 PM",riseH:6.25,setH:20.333,dayLen:"14h 5m",moon:"first-quarter" },
  { day:3, dow:"Mon", amHigh:[2,37,4.2], pmHigh:[3,33,4.9], amLow:[9,9,0.8], pmLow:[10,6,1.5], rise:"6:16 AM",set:"8:19 PM",riseH:6.267,setH:20.317,dayLen:"14h 3m",moon:"waxing-gibbous" },
  { day:4, dow:"Tue", amHigh:[3,39,3.8], pmHigh:[4,9,5.1], amLow:[9,46,1.4], pmLow:[11,11,1.2], rise:"6:17 AM",set:"8:18 PM",riseH:6.283,setH:20.3,dayLen:"14h 1m",moon:"waxing-gibbous" },
  { day:5, dow:"Wed", amHigh:[5,2,3.4], pmHigh:[4,52,5.3], amLow:[10,30,2.0], pmLow:null, rise:"6:18 AM",set:"8:17 PM",riseH:6.3,setH:20.283,dayLen:"13h 59m",moon:"waxing-gibbous" },
  { day:6, dow:"Thu", amHigh:[6,47,3.2], pmHigh:[5,43,5.4], amLow:[12,22,0.8], pmLow:[11,26,2.6], rise:"6:19 AM",set:"8:16 PM",riseH:6.317,setH:20.267,dayLen:"13h 57m",moon:"waxing-gibbous" },
  { day:7, dow:"Fri", amHigh:[8,32,3.4], pmHigh:[6,43,5.6], amLow:[1,36,0.3], pmLow:[12,40,2.9], rise:"6:20 AM",set:"8:15 PM",riseH:6.333,setH:20.25,dayLen:"13h 55m",moon:"waxing-gibbous" },
  { day:8, dow:"Sat", amHigh:[9,45,3.7], pmHigh:[7,48,5.8], amLow:[2,43,-0.1], pmLow:[1,59,3.1], rise:"6:20 AM",set:"8:14 PM",riseH:6.333,setH:20.233,dayLen:"13h 54m",moon:"waxing-gibbous" },
  { day:9, dow:"Sun", amHigh:[10,38,4.0], pmHigh:[8,50,6.0], amLow:[3,43,-0.5], pmLow:[3,9,3.0], rise:"6:21 AM",set:"8:13 PM",riseH:6.35,setH:20.217,dayLen:"13h 52m",moon:"full" },
  { day:10, dow:"Mon", amHigh:[11,21,4.2], pmHigh:[9,49,6.1], amLow:[4,35,-0.8], pmLow:[4,11,2.7], rise:"6:22 AM",set:"8:11 PM",riseH:6.367,setH:20.183,dayLen:"13h 49m",moon:"full" },
  { day:11, dow:"Tue", amHigh:null, pmHigh:[12,0,4.4], amLow:[5,23,-1.0], pmLow:[5,7,2.4], rise:"6:23 AM",set:"8:10 PM",riseH:6.383,setH:20.167,dayLen:"13h 47m",moon:"waning-gibbous" },
  { day:12, dow:"Wed", amHigh:null, pmHigh:[12,37,4.6], amLow:[6,7,-1.0], pmLow:[6,0,2.0], rise:"6:24 AM",set:"8:09 PM",riseH:6.4,setH:20.15,dayLen:"13h 45m",moon:"waning-gibbous" },
  { day:13, dow:"Thu", amHigh:null, pmHigh:[1,13,4.8], amLow:[6,48,-0.8], pmLow:[6,52,1.7], rise:"6:25 AM",set:"8:08 PM",riseH:6.417,setH:20.133,dayLen:"13h 43m",moon:"waning-gibbous" },
  { day:14, dow:"Fri", amHigh:[0,29,5.5], pmHigh:[1,47,4.9], amLow:[7,26,-0.4], pmLow:[7,44,1.5], rise:"6:26 AM",set:"8:06 PM",riseH:6.433,setH:20.1,dayLen:"13h 40m",moon:"waning-gibbous" },
  { day:15, dow:"Sat", amHigh:[1,20,5.1], pmHigh:[2,21,5.0], amLow:[8,3,0.1], pmLow:[8,36,1.3], rise:"6:27 AM",set:"8:05 PM",riseH:6.45,setH:20.083,dayLen:"13h 38m",moon:"waning-gibbous" },
  { day:16, dow:"Sun", amHigh:[2,13,4.6], pmHigh:[2,55,5.1], amLow:[8,40,0.7], pmLow:[9,31,1.2], rise:"6:27 AM",set:"8:04 PM",riseH:6.45,setH:20.067,dayLen:"13h 37m",moon:"third-quarter" },
  { day:17, dow:"Mon", amHigh:[3,11,4.1], pmHigh:[3,30,5.1], amLow:[9,18,1.4], pmLow:[10,29,1.1], rise:"6:28 AM",set:"8:03 PM",riseH:6.467,setH:20.05,dayLen:"13h 35m",moon:"third-quarter" },
  { day:18, dow:"Tue", amHigh:[4,20,3.6], pmHigh:[4,8,5.0], amLow:[9,59,2.1], pmLow:[11,34,1.0], rise:"6:29 AM",set:"8:01 PM",riseH:6.483,setH:20.017,dayLen:"13h 32m",moon:"waning-crescent" },
  { day:19, dow:"Wed", amHigh:[5,49,3.4], pmHigh:[4,51,4.9], amLow:[10,50,2.6], pmLow:null, rise:"6:30 AM",set:"8:00 PM",riseH:6.5,setH:20.0,dayLen:"13h 30m",moon:"waning-crescent" },
  { day:20, dow:"Thu", amHigh:[7,39,3.4], pmHigh:[5,44,4.8], amLow:[0,43,0.9], pmLow:[12,1,3.1], rise:"6:31 AM",set:"7:59 PM",riseH:6.517,setH:19.983,dayLen:"13h 28m",moon:"waning-crescent" },
  { day:21, dow:"Fri", amHigh:[9,6,3.6], pmHigh:[6,43,4.8], amLow:[1,51,0.8], pmLow:[1,24,3.2], rise:"6:32 AM",set:"7:57 PM",riseH:6.533,setH:19.95,dayLen:"13h 25m",moon:"waning-crescent" },
  { day:22, dow:"Sat", amHigh:[9,59,3.8], pmHigh:[7,43,4.9], amLow:[2,51,0.6], pmLow:[2,33,3.2], rise:"6:33 AM",set:"7:56 PM",riseH:6.55,setH:19.933,dayLen:"13h 23m",moon:"waning-crescent" },
  { day:23, dow:"Sun", amHigh:[10,37,4.0], pmHigh:[8,37,5.0], amLow:[3,42,0.3], pmLow:[3,27,3.0], rise:"6:34 AM",set:"7:54 PM",riseH:6.567,setH:19.9,dayLen:"13h 20m",moon:"waning-crescent" },
  { day:24, dow:"Mon", amHigh:[11,7,4.0], pmHigh:[9,25,5.1], amLow:[4,23,0.2], pmLow:[4,10,2.8], rise:"6:34 AM",set:"7:53 PM",riseH:6.567,setH:19.883,dayLen:"13h 19m",moon:"new" },
  { day:25, dow:"Tue", amHigh:[11,34,4.1], pmHigh:[10,9,5.2], amLow:[4,59,0.0], pmLow:[4,48,2.6], rise:"6:35 AM",set:"7:52 PM",riseH:6.583,setH:19.867,dayLen:"13h 17m",moon:"waxing-crescent" },
  { day:26, dow:"Wed", amHigh:[11,58,4.2], pmHigh:[10,51,5.2], amLow:[5,31,-0.1], pmLow:[5,24,2.3], rise:"6:36 AM",set:"7:50 PM",riseH:6.6,setH:19.833,dayLen:"13h 14m",moon:"waxing-crescent" },
  { day:27, dow:"Thu", amHigh:null, pmHigh:[12,22,4.4], amLow:[6,0,-0.1], pmLow:[5,59,2.0], rise:"6:37 AM",set:"7:49 PM",riseH:6.617,setH:19.817,dayLen:"13h 12m",moon:"waxing-crescent" },
  { day:28, dow:"Fri", amHigh:null, pmHigh:[12,46,4.5], amLow:[6,29,0.0], pmLow:[6,36,1.7], rise:"6:38 AM",set:"7:47 PM",riseH:6.633,setH:19.783,dayLen:"13h 9m",moon:"waxing-crescent" },
  { day:29, dow:"Sat", amHigh:[0,14,5.0], pmHigh:[1,11,4.7], amLow:[6,57,0.3], pmLow:[7,15,1.4], rise:"6:39 AM",set:"7:46 PM",riseH:6.65,setH:19.767,dayLen:"13h 7m",moon:"waxing-crescent" },
  { day:30, dow:"Sun", amHigh:[0,58,4.7], pmHigh:[1,37,4.9], amLow:[7,27,0.6], pmLow:[7,57,1.1], rise:"6:40 AM",set:"7:44 PM",riseH:6.667,setH:19.733,dayLen:"13h 4m",moon:"waxing-crescent" },
  { day:31, dow:"Mon", amHigh:[1,48,4.4], pmHigh:[2,6,5.1], amLow:[7,59,1.1], pmLow:[8,45,0.8], rise:"6:40 AM",set:"7:43 PM",riseH:6.667,setH:19.717,dayLen:"13h 3m",moon:"first-quarter" },
];

const SEP_DATA = [
  { day:1, dow:"Tue", amHigh:[2,45,4.1], pmHigh:[2,40,5.3], amLow:[8,34,1.6], pmLow:[9,39,0.6], rise:"6:41 AM",set:"7:41 PM",riseH:6.683,setH:19.683,dayLen:"13h 0m",moon:"first-quarter" },
  { day:2, dow:"Wed", amHigh:[3,54,3.7], pmHigh:[3,20,5.3], amLow:[9,14,2.2], pmLow:[10,43,0.5], rise:"6:42 AM",set:"7:40 PM",riseH:6.7,setH:19.667,dayLen:"12h 58m",moon:"waxing-gibbous" },
  { day:3, dow:"Thu", amHigh:[5,22,3.5], pmHigh:[4,11,5.3], amLow:[10,5,2.7], pmLow:[11,57,0.3], rise:"6:43 AM",set:"7:38 PM",riseH:6.717,setH:19.633,dayLen:"12h 55m",moon:"waxing-gibbous" },
  { day:4, dow:"Fri", amHigh:[7,5,3.5], pmHigh:[5,15,5.3], amLow:[11,17,3.1], pmLow:null, rise:"6:44 AM",set:"7:37 PM",riseH:6.733,setH:19.617,dayLen:"12h 53m",moon:"waxing-gibbous" },
  { day:5, dow:"Sat", amHigh:[8,30,3.7], pmHigh:[6,29,5.4], amLow:[1,16,0.1], pmLow:[12,49,3.2], rise:"6:45 AM",set:"7:35 PM",riseH:6.75,setH:19.583,dayLen:"12h 50m",moon:"waxing-gibbous" },
  { day:6, dow:"Sun", amHigh:[9,26,4.0], pmHigh:[7,41,5.4], amLow:[2,27,-0.1], pmLow:[2,12,3.0], rise:"6:46 AM",set:"7:34 PM",riseH:6.767,setH:19.567,dayLen:"12h 48m",moon:"waxing-gibbous" },
  { day:7, dow:"Mon", amHigh:[10,10,4.3], pmHigh:[8,48,5.5], amLow:[3,26,-0.4], pmLow:[3,18,2.6], rise:"6:47 AM",set:"7:32 PM",riseH:6.783,setH:19.533,dayLen:"12h 45m",moon:"full" },
  { day:8, dow:"Tue", amHigh:[10,47,4.5], pmHigh:[9,47,5.6], amLow:[4,16,-0.5], pmLow:[4,14,2.1], rise:"6:47 AM",set:"7:31 PM",riseH:6.783,setH:19.517,dayLen:"12h 44m",moon:"full" },
  { day:9, dow:"Wed", amHigh:[11,22,4.7], pmHigh:[10,42,5.5], amLow:[4,59,-0.4], pmLow:[5,5,1.7], rise:"6:48 AM",set:"7:29 PM",riseH:6.8,setH:19.483,dayLen:"12h 41m",moon:"waning-gibbous" },
  { day:10, dow:"Thu", amHigh:[11,55,4.9], pmHigh:[11,34,5.3], amLow:[5,38,-0.2], pmLow:[5,52,1.2], rise:"6:49 AM",set:"7:27 PM",riseH:6.817,setH:19.45,dayLen:"12h 38m",moon:"waning-gibbous" },
  { day:11, dow:"Fri", amHigh:null, pmHigh:[12,26,5.0], amLow:[6,15,0.1], pmLow:[6,38,0.9], rise:"6:50 AM",set:"7:26 PM",riseH:6.833,setH:19.433,dayLen:"12h 36m",moon:"waning-gibbous" },
  { day:12, dow:"Sat", amHigh:[0,25,5.0], pmHigh:[12,57,5.1], amLow:[6,50,0.6], pmLow:[7,23,0.7], rise:"6:51 AM",set:"7:24 PM",riseH:6.85,setH:19.4,dayLen:"12h 33m",moon:"waning-gibbous" },
  { day:13, dow:"Sun", amHigh:[1,16,4.6], pmHigh:[1,26,5.2], amLow:[7,25,1.1], pmLow:[8,8,0.5], rise:"6:52 AM",set:"7:23 PM",riseH:6.867,setH:19.383,dayLen:"12h 31m",moon:"waning-gibbous" },
  { day:14, dow:"Mon", amHigh:[2,9,4.3], pmHigh:[1,56,5.1], amLow:[8,0,1.7], pmLow:[8,54,0.5], rise:"6:53 AM",set:"7:21 PM",riseH:6.883,setH:19.35,dayLen:"12h 28m",moon:"waning-gibbous" },
  { day:15, dow:"Tue", amHigh:[3,7,4.0], pmHigh:[2,28,5.0], amLow:[8,37,2.2], pmLow:[9,43,0.6], rise:"6:53 AM",set:"7:20 PM",riseH:6.883,setH:19.333,dayLen:"12h 27m",moon:"third-quarter" },
  { day:16, dow:"Wed", amHigh:[4,14,3.7], pmHigh:[3,4,4.9], amLow:[9,19,2.7], pmLow:[10,39,0.7], rise:"6:54 AM",set:"7:18 PM",riseH:6.9,setH:19.3,dayLen:"12h 24m",moon:"third-quarter" },
  { day:17, dow:"Thu", amHigh:[5,40,3.5], pmHigh:[3,50,4.7], amLow:[10,15,3.1], pmLow:[11,46,0.8], rise:"6:55 AM",set:"7:16 PM",riseH:6.917,setH:19.267,dayLen:"12h 21m",moon:"waning-crescent" },
  { day:18, dow:"Fri", amHigh:[7,20,3.6], pmHigh:[4,49,4.5], amLow:[11,41,3.3], pmLow:null, rise:"6:56 AM",set:"7:15 PM",riseH:6.933,setH:19.25,dayLen:"12h 19m",moon:"waning-crescent" },
  { day:19, dow:"Sat", amHigh:[8,32,3.7], pmHigh:[5,59,4.5], amLow:[0,58,0.8], pmLow:[1,12,3.3], rise:"6:57 AM",set:"7:13 PM",riseH:6.95,setH:19.217,dayLen:"12h 16m",moon:"waning-crescent" },
  { day:20, dow:"Sun", amHigh:[9,16,3.9], pmHigh:[7,8,4.5], amLow:[2,3,0.7], pmLow:[2,18,3.1], rise:"6:58 AM",set:"7:12 PM",riseH:6.967,setH:19.2,dayLen:"12h 14m",moon:"waning-crescent" },
  { day:21, dow:"Mon", amHigh:[9,48,4.0], pmHigh:[8,8,4.6], amLow:[2,56,0.5], pmLow:[3,8,2.8], rise:"6:59 AM",set:"7:10 PM",riseH:6.983,setH:19.167,dayLen:"12h 11m",moon:"waning-crescent" },
  { day:22, dow:"Tue", amHigh:[10,14,4.1], pmHigh:[9,1,4.7], amLow:[3,38,0.4], pmLow:[3,49,2.4], rise:"6:59 AM",set:"7:09 PM",riseH:6.983,setH:19.15,dayLen:"12h 10m",moon:"new" },
  { day:23, dow:"Wed", amHigh:[10,37,4.3], pmHigh:[9,49,4.8], amLow:[4,14,0.3], pmLow:[4,26,2.0], rise:"7:00 AM",set:"7:07 PM",riseH:7.0,setH:19.117,dayLen:"12h 7m",moon:"new" },
  { day:24, dow:"Thu", amHigh:[11,0,4.5], pmHigh:[10,36,4.8], amLow:[4,46,0.3], pmLow:[5,2,1.6], rise:"7:01 AM",set:"7:05 PM",riseH:7.017,setH:19.083,dayLen:"12h 4m",moon:"waxing-crescent" },
  { day:25, dow:"Fri", amHigh:[11,23,4.7], pmHigh:[11,22,4.8], amLow:[5,16,0.4], pmLow:[5,37,1.1], rise:"7:02 AM",set:"7:04 PM",riseH:7.033,setH:19.067,dayLen:"12h 2m",moon:"waxing-crescent" },
  { day:26, dow:"Sat", amHigh:[11,48,5.0], pmHigh:null, amLow:[5,46,0.7], pmLow:[6,14,0.7], rise:"7:03 AM",set:"7:02 PM",riseH:7.05,setH:19.033,dayLen:"11h 59m",moon:"waxing-crescent" },
  { day:27, dow:"Sun", amHigh:[0,10,4.7], pmHigh:[12,15,5.2], amLow:[6,18,1.1], pmLow:[6,54,0.3], rise:"7:04 AM",set:"7:01 PM",riseH:7.067,setH:19.017,dayLen:"11h 57m",moon:"waxing-crescent" },
  { day:28, dow:"Mon", amHigh:[1,1,4.5], pmHigh:[12,45,5.4], amLow:[6,51,1.5], pmLow:[7,38,0.0], rise:"7:05 AM",set:"6:59 PM",riseH:7.083,setH:18.983,dayLen:"11h 54m",moon:"waxing-crescent" },
  { day:29, dow:"Tue", amHigh:[1,57,4.3], pmHigh:[1,18,5.5], amLow:[7,28,2.0], pmLow:[8,26,-0.2], rise:"7:06 AM",set:"6:58 PM",riseH:7.1,setH:18.967,dayLen:"11h 52m",moon:"waxing-crescent" },
  { day:30, dow:"Wed", amHigh:[2,59,4.0], pmHigh:[1,58,5.5], amLow:[8,8,2.4], pmLow:[9,20,-0.2], rise:"7:07 AM",set:"6:56 PM",riseH:7.117,setH:18.933,dayLen:"11h 49m",moon:"first-quarter" },
];

const OCT_DATA = [
  { day:1, dow:"Thu", amHigh:[4,12,3.8], pmHigh:[2,46,5.4], amLow:[8,56,2.8], pmLow:[10,24,-0.2], rise:"7:07 AM",set:"6:54 PM",riseH:7.117,setH:18.9,dayLen:"11h 47m",moon:"waxing-gibbous" },
  { day:2, dow:"Fri", amHigh:[5,35,3.8], pmHigh:[3,46,5.2], amLow:[10,1,3.1], pmLow:[11,37,-0.1], rise:"7:08 AM",set:"6:53 PM",riseH:7.133,setH:18.883,dayLen:"11h 45m",moon:"waxing-gibbous" },
  { day:3, dow:"Sat", amHigh:[6,59,3.8], pmHigh:[4,59,5.0], amLow:[11,32,3.2], pmLow:null, rise:"7:09 AM",set:"6:51 PM",riseH:7.15,setH:18.85,dayLen:"11h 42m",moon:"waxing-gibbous" },
  { day:4, dow:"Sun", amHigh:[8,4,4.1], pmHigh:[6,20,4.9], amLow:[0,54,-0.1], pmLow:[1,8,3.0], rise:"7:10 AM",set:"6:50 PM",riseH:7.167,setH:18.833,dayLen:"11h 40m",moon:"waxing-gibbous" },
  { day:5, dow:"Mon", amHigh:[8,52,4.3], pmHigh:[7,37,4.9], amLow:[2,2,-0.1], pmLow:[2,23,2.5], rise:"7:11 AM",set:"6:48 PM",riseH:7.183,setH:18.8,dayLen:"11h 37m",moon:"waxing-gibbous" },
  { day:6, dow:"Tue", amHigh:[9,32,4.6], pmHigh:[8,46,4.9], amLow:[2,58,-0.1], pmLow:[3,22,1.9], rise:"7:12 AM",set:"6:47 PM",riseH:7.2,setH:18.783,dayLen:"11h 35m",moon:"waxing-gibbous" },
  { day:7, dow:"Wed", amHigh:[10,7,4.8], pmHigh:[9,47,4.8], amLow:[3,45,0.1], pmLow:[4,14,1.3], rise:"7:13 AM",set:"6:45 PM",riseH:7.217,setH:18.75,dayLen:"11h 32m",moon:"full" },
  { day:8, dow:"Thu", amHigh:[10,39,5.0], pmHigh:[10,43,4.7], amLow:[4,26,0.3], pmLow:[5,0,0.8], rise:"7:14 AM",set:"6:44 PM",riseH:7.233,setH:18.733,dayLen:"11h 30m",moon:"full" },
  { day:9, dow:"Fri", amHigh:[11,10,5.2], pmHigh:[11,37,4.6], amLow:[5,4,0.7], pmLow:[5,43,0.4], rise:"7:15 AM",set:"6:42 PM",riseH:7.25,setH:18.7,dayLen:"11h 27m",moon:"waning-gibbous" },
  { day:10, dow:"Sat", amHigh:[11,38,5.3], pmHigh:null, amLow:[5,39,1.1], pmLow:[6,23,0.1], rise:"7:16 AM",set:"6:41 PM",riseH:7.267,setH:18.683,dayLen:"11h 25m",moon:"waning-gibbous" },
  { day:11, dow:"Sun", amHigh:[0,28,4.4], pmHigh:[12,6,5.3], amLow:[6,14,1.6], pmLow:[7,3,-0.1], rise:"7:17 AM",set:"6:39 PM",riseH:7.283,setH:18.65,dayLen:"11h 22m",moon:"waning-gibbous" },
  { day:12, dow:"Mon", amHigh:[1,20,4.3], pmHigh:[12,34,5.2], amLow:[6,50,2.1], pmLow:[7,41,-0.1], rise:"7:18 AM",set:"6:38 PM",riseH:7.3,setH:18.633,dayLen:"11h 20m",moon:"waning-gibbous" },
  { day:13, dow:"Tue", amHigh:[2,12,4.1], pmHigh:[1,2,5.1], amLow:[7,26,2.5], pmLow:[8,21,0.0], rise:"7:19 AM",set:"6:36 PM",riseH:7.317,setH:18.6,dayLen:"11h 17m",moon:"waning-gibbous" },
  { day:14, dow:"Wed", amHigh:[3,7,3.9], pmHigh:[1,34,5.0], amLow:[8,4,2.9], pmLow:[9,5,0.1], rise:"7:20 AM",set:"6:35 PM",riseH:7.333,setH:18.583,dayLen:"11h 15m",moon:"third-quarter" },
  { day:15, dow:"Thu", amHigh:[4,9,3.8], pmHigh:[2,12,4.8], amLow:[8,49,3.1], pmLow:[9,54,0.3], rise:"7:21 AM",set:"6:34 PM",riseH:7.35,setH:18.567,dayLen:"11h 13m",moon:"third-quarter" },
  { day:16, dow:"Fri", amHigh:[5,20,3.7], pmHigh:[2,59,4.5], amLow:[9,48,3.3], pmLow:[10,52,0.5], rise:"7:22 AM",set:"6:32 PM",riseH:7.367,setH:18.533,dayLen:"11h 10m",moon:"waning-crescent" },
  { day:17, dow:"Sat", amHigh:[6,36,3.7], pmHigh:[3,58,4.3], amLow:[11,16,3.4], pmLow:[11,58,0.6], rise:"7:23 AM",set:"6:31 PM",riseH:7.383,setH:18.517,dayLen:"11h 8m",moon:"waning-crescent" },
  { day:18, dow:"Sun", amHigh:[7,35,3.8], pmHigh:[5,9,4.1], amLow:[12,45,3.2], pmLow:null, rise:"7:23 AM",set:"6:29 PM",riseH:7.383,setH:18.483,dayLen:"11h 6m",moon:"waning-crescent" },
  { day:19, dow:"Mon", amHigh:[8,15,3.9], pmHigh:[6,23,4.1], amLow:[1,2,0.6], pmLow:[1,51,2.9], rise:"7:24 AM",set:"6:28 PM",riseH:7.4,setH:18.467,dayLen:"11h 4m",moon:"waning-crescent" },
  { day:20, dow:"Tue", amHigh:[8,45,4.1], pmHigh:[7,32,4.1], amLow:[1,55,0.6], pmLow:[2,42,2.4], rise:"7:25 AM",set:"6:27 PM",riseH:7.417,setH:18.45,dayLen:"11h 2m",moon:"waning-crescent" },
  { day:21, dow:"Wed", amHigh:[9,11,4.3], pmHigh:[8,34,4.1], amLow:[2,40,0.6], pmLow:[3,24,1.9], rise:"7:26 AM",set:"6:25 PM",riseH:7.433,setH:18.417,dayLen:"10h 59m",moon:"waning-crescent" },
  { day:22, dow:"Thu", amHigh:[9,35,4.6], pmHigh:[9,31,4.2], amLow:[3,18,0.7], pmLow:[4,1,1.4], rise:"7:27 AM",set:"6:24 PM",riseH:7.45,setH:18.4,dayLen:"10h 57m",moon:"new" },
  { day:23, dow:"Fri", amHigh:[10,0,4.9], pmHigh:[10,25,4.3], amLow:[3,54,0.9], pmLow:[4,38,0.8], rise:"7:29 AM",set:"6:23 PM",riseH:7.483,setH:18.383,dayLen:"10h 54m",moon:"new" },
  { day:24, dow:"Sat", amHigh:[10,27,5.1], pmHigh:[11,19,4.3], amLow:[4,29,1.1], pmLow:[5,15,0.2], rise:"7:30 AM",set:"6:22 PM",riseH:7.5,setH:18.367,dayLen:"10h 52m",moon:"waxing-crescent" },
  { day:25, dow:"Sun", amHigh:[10,55,5.4], pmHigh:null, amLow:[5,4,1.5], pmLow:[5,54,-0.3], rise:"7:31 AM",set:"6:20 PM",riseH:7.517,setH:18.333,dayLen:"10h 49m",moon:"waxing-crescent" },
  { day:26, dow:"Mon", amHigh:[12,13,4.3], pmHigh:[11,27,5.6], amLow:[5,41,1.9], pmLow:[6,37,-0.7], rise:"7:32 AM",set:"6:19 PM",riseH:7.533,setH:18.317,dayLen:"10h 47m",moon:"waxing-crescent" },
  { day:27, dow:"Tue", amHigh:[1,9,4.3], pmHigh:[12,3,5.8], amLow:[6,21,2.3], pmLow:[7,22,-1.0], rise:"7:33 AM",set:"6:18 PM",riseH:7.55,setH:18.3,dayLen:"10h 45m",moon:"waxing-crescent" },
  { day:28, dow:"Wed", amHigh:[2,7,4.2], pmHigh:[12,44,5.8], amLow:[7,4,2.6], pmLow:[8,12,-1.0], rise:"7:34 AM",set:"6:17 PM",riseH:7.567,setH:18.283,dayLen:"10h 43m",moon:"waxing-crescent" },
  { day:29, dow:"Thu", amHigh:[3,9,4.1], pmHigh:[1,31,5.7], amLow:[7,52,2.9], pmLow:[9,7,-0.9], rise:"7:35 AM",set:"6:15 PM",riseH:7.583,setH:18.25,dayLen:"10h 40m",moon:"first-quarter" },
  { day:30, dow:"Fri", amHigh:[4,15,4.0], pmHigh:[2,27,5.4], amLow:[8,52,3.1], pmLow:[10,9,-0.7], rise:"7:36 AM",set:"6:14 PM",riseH:7.6,setH:18.233,dayLen:"10h 38m",moon:"first-quarter" },
  { day:31, dow:"Sat", amHigh:[5,23,4.1], pmHigh:[3,32,5.1], amLow:[10,10,3.1], pmLow:[11,16,-0.4], rise:"7:37 AM",set:"6:13 PM",riseH:7.617,setH:18.217,dayLen:"10h 36m",moon:"waxing-gibbous" },
];

const NOV_DATA = [
  { day:1, dow:"Sun", amHigh:[5,28,4.2], pmHigh:[3,47,4.7], amLow:[10,44,3.0], pmLow:[11,24,-0.1], rise:"6:38 AM",set:"5:12 PM",riseH:6.633,setH:17.2,dayLen:"10h 34m",moon:"waxing-gibbous" },
  { day:2, dow:"Mon", amHigh:[6,23,4.4], pmHigh:[5,9,4.4], amLow:null, pmLow:[12,11,2.5], rise:"6:39 AM",set:"5:11 PM",riseH:6.65,setH:17.183,dayLen:"10h 32m",moon:"waxing-gibbous" },
  { day:3, dow:"Tue", amHigh:[7,9,4.6], pmHigh:[6,31,4.2], amLow:[0,26,0.1], pmLow:[1,21,1.9], rise:"6:40 AM",set:"5:10 PM",riseH:6.667,setH:17.167,dayLen:"10h 30m",moon:"waxing-gibbous" },
  { day:4, dow:"Wed", amHigh:[7,48,4.9], pmHigh:[7,45,4.1], amLow:[1,20,0.4], pmLow:[2,19,1.2], rise:"6:41 AM",set:"5:09 PM",riseH:6.683,setH:17.15,dayLen:"10h 28m",moon:"waxing-gibbous" },
  { day:5, dow:"Thu", amHigh:[8,23,5.1], pmHigh:[8,51,4.1], amLow:[2,7,0.8], pmLow:[3,8,0.6], rise:"6:42 AM",set:"5:08 PM",riseH:6.7,setH:17.133,dayLen:"10h 26m",moon:"full" },
  { day:6, dow:"Fri", amHigh:[8,56,5.3], pmHigh:[9,51,4.1], amLow:[2,49,1.2], pmLow:[3,52,0.2], rise:"6:43 AM",set:"5:07 PM",riseH:6.717,setH:17.117,dayLen:"10h 24m",moon:"full" },
  { day:7, dow:"Sat", amHigh:[9,26,5.4], pmHigh:[10,46,4.1], amLow:[3,29,1.6], pmLow:[4,31,-0.2], rise:"6:44 AM",set:"5:06 PM",riseH:6.733,setH:17.1,dayLen:"10h 22m",moon:"waning-gibbous" },
  { day:8, dow:"Sun", amHigh:[9,54,5.4], pmHigh:[11,38,4.1], amLow:[4,7,2.1], pmLow:[5,8,-0.4], rise:"6:45 AM",set:"5:05 PM",riseH:6.75,setH:17.083,dayLen:"10h 20m",moon:"waning-gibbous" },
  { day:9, dow:"Mon", amHigh:[10,23,5.4], pmHigh:null, amLow:[4,45,2.4], pmLow:[5,44,-0.5], rise:"6:46 AM",set:"5:04 PM",riseH:6.767,setH:17.067,dayLen:"10h 18m",moon:"waning-gibbous" },
  { day:10, dow:"Tue", amHigh:[12,27,4.1], pmHigh:[10,52,5.3], amLow:[5,22,2.8], pmLow:[6,20,-0.5], rise:"6:48 AM",set:"5:03 PM",riseH:6.8,setH:17.05,dayLen:"10h 15m",moon:"waning-gibbous" },
  { day:11, dow:"Wed", amHigh:[1,15,4.0], pmHigh:[11,23,5.2], amLow:[6,1,3.0], pmLow:[6,57,-0.4], rise:"6:49 AM",set:"5:02 PM",riseH:6.817,setH:17.033,dayLen:"10h 13m",moon:"waning-gibbous" },
  { day:12, dow:"Thu", amHigh:[2,3,4.0], pmHigh:[11,58,5.0], amLow:[6,41,3.2], pmLow:[7,37,-0.3], rise:"6:50 AM",set:"5:01 PM",riseH:6.833,setH:17.017,dayLen:"10h 11m",moon:"waning-gibbous" },
  { day:13, dow:"Fri", amHigh:[2,52,3.9], pmHigh:[12,37,4.8], amLow:[7,26,3.3], pmLow:[8,20,-0.1], rise:"6:51 AM",set:"5:01 PM",riseH:6.85,setH:17.017,dayLen:"10h 10m",moon:"third-quarter" },
  { day:14, dow:"Sat", amHigh:[3,44,3.8], pmHigh:[1,22,4.5], amLow:[8,21,3.3], pmLow:[9,8,0.1], rise:"6:52 AM",set:"5:00 PM",riseH:6.867,setH:17.0,dayLen:"10h 8m",moon:"third-quarter" },
  { day:15, dow:"Sun", amHigh:[4,35,3.8], pmHigh:[2,15,4.2], amLow:[9,34,3.3], pmLow:[9,59,0.3], rise:"6:53 AM",set:"4:59 PM",riseH:6.883,setH:16.983,dayLen:"10h 6m",moon:"waning-crescent" },
  { day:16, dow:"Mon", amHigh:[5,21,3.9], pmHigh:[3,19,3.9], amLow:[10,58,3.1], pmLow:[10,52,0.5], rise:"6:54 AM",set:"4:58 PM",riseH:6.9,setH:16.967,dayLen:"10h 4m",moon:"waning-crescent" },
  { day:17, dow:"Tue", amHigh:[6,0,4.1], pmHigh:[4,32,3.7], amLow:[12,9,2.7], pmLow:null, rise:"6:55 AM",set:"4:58 PM",riseH:6.917,setH:16.967,dayLen:"10h 3m",moon:"waning-crescent" },
  { day:18, dow:"Wed", amHigh:[6,33,4.3], pmHigh:[5,51,3.6], amLow:[1,5,2.2], pmLow:null, rise:"6:56 AM",set:"4:57 PM",riseH:6.933,setH:16.95,dayLen:"10h 1m",moon:"waning-crescent" },
  { day:19, dow:"Thu", amHigh:[7,3,4.6], pmHigh:[7,8,3.6], amLow:[0,32,0.9], pmLow:[1,52,1.5], rise:"6:57 AM",set:"4:56 PM",riseH:6.95,setH:16.933,dayLen:"9h 59m",moon:"waning-crescent" },
  { day:20, dow:"Fri", amHigh:[7,33,4.9], pmHigh:[8,19,3.7], amLow:[1,17,1.2], pmLow:[2,33,0.8], rise:"6:58 AM",set:"4:56 PM",riseH:6.967,setH:16.933,dayLen:"9h 58m",moon:"new" },
  { day:21, dow:"Sat", amHigh:[8,3,5.2], pmHigh:[9,23,3.9], amLow:[2,0,1.6], pmLow:[3,14,0.1], rise:"6:59 AM",set:"4:55 PM",riseH:6.983,setH:16.917,dayLen:"9h 56m",moon:"new" },
  { day:22, dow:"Sun", amHigh:[8,36,5.6], pmHigh:[10,22,4.0], amLow:[2,43,1.9], pmLow:[3,55,-0.5], rise:"7:00 AM",set:"4:55 PM",riseH:7.0,setH:16.917,dayLen:"9h 55m",moon:"waxing-crescent" },
  { day:23, dow:"Mon", amHigh:[9,13,5.8], pmHigh:[11,19,4.2], amLow:[3,27,2.3], pmLow:[4,38,-1.0], rise:"7:01 AM",set:"4:54 PM",riseH:7.017,setH:16.9,dayLen:"9h 53m",moon:"waxing-crescent" },
  { day:24, dow:"Tue", amHigh:[9,53,6.0], pmHigh:null, amLow:[4,12,2.6], pmLow:[5,23,-1.4], rise:"7:02 AM",set:"4:54 PM",riseH:7.033,setH:16.9,dayLen:"9h 52m",moon:"waxing-crescent" },
  { day:25, dow:"Wed", amHigh:[12,14,4.3], pmHigh:[10,37,6.1], amLow:[4,59,2.8], pmLow:[6,12,-1.5], rise:"7:04 AM",set:"4:53 PM",riseH:7.067,setH:16.883,dayLen:"9h 49m",moon:"waxing-crescent" },
  { day:26, dow:"Thu", amHigh:[1,8,4.3], pmHigh:[11,26,6.0], amLow:[5,50,2.9], pmLow:[7,2,-1.5], rise:"7:05 AM",set:"4:53 PM",riseH:7.083,setH:16.883,dayLen:"9h 48m",moon:"waxing-crescent" },
  { day:27, dow:"Fri", amHigh:[2,2,4.3], pmHigh:[12,19,5.8], amLow:[6,46,2.9], pmLow:[7,55,-1.2], rise:"7:06 AM",set:"4:53 PM",riseH:7.1,setH:16.883,dayLen:"9h 47m",moon:"waxing-crescent" },
  { day:28, dow:"Sat", amHigh:[2,57,4.3], pmHigh:[1,16,5.4], amLow:[7,51,2.9], pmLow:[8,50,-0.9], rise:"7:07 AM",set:"4:52 PM",riseH:7.117,setH:16.867,dayLen:"9h 45m",moon:"first-quarter" },
  { day:29, dow:"Sun", amHigh:[3,51,4.4], pmHigh:[2,20,4.9], amLow:[9,9,2.8], pmLow:[9,47,-0.5], rise:"7:08 AM",set:"4:52 PM",riseH:7.133,setH:16.867,dayLen:"9h 44m",moon:"waxing-gibbous" },
  { day:30, dow:"Mon", amHigh:[4,44,4.5], pmHigh:[3,33,4.4], amLow:[10,35,2.5], pmLow:[10,44,0.1], rise:"7:08 AM",set:"4:52 PM",riseH:7.133,setH:16.867,dayLen:"9h 44m",moon:"waxing-gibbous" },
];

const DEC_DATA = [
  { day:1, dow:"Tue", amHigh:[5,33,4.7], pmHigh:[4,55,3.9], amLow:[11,57,2.0], pmLow:[11,41,0.6], rise:"7:09 AM",set:"4:52 PM",riseH:7.15,setH:16.867,dayLen:"9h 43m",moon:"waxing-gibbous" },
  { day:2, dow:"Wed", amHigh:[6,19,4.9], pmHigh:[6,24,3.6], amLow:null, pmLow:[1,7,1.3], rise:"7:10 AM",set:"4:51 PM",riseH:7.167,setH:16.85,dayLen:"9h 41m",moon:"waxing-gibbous" },
  { day:3, dow:"Thu", amHigh:[7,0,5.2], pmHigh:[7,48,3.6], amLow:[0,35,1.1], pmLow:[2,7,0.7], rise:"7:11 AM",set:"4:51 PM",riseH:7.183,setH:16.85,dayLen:"9h 40m",moon:"waxing-gibbous" },
  { day:4, dow:"Fri", amHigh:[7,38,5.3], pmHigh:[9,1,3.7], amLow:[1,26,1.6], pmLow:[2,57,0.2], rise:"7:12 AM",set:"4:51 PM",riseH:7.2,setH:16.85,dayLen:"9h 39m",moon:"waxing-gibbous" },
  { day:5, dow:"Sat", amHigh:[8,13,5.4], pmHigh:[10,3,3.8], amLow:[2,15,2.1], pmLow:[3,40,-0.2], rise:"7:13 AM",set:"4:51 PM",riseH:7.217,setH:16.85,dayLen:"9h 38m",moon:"full" },
  { day:6, dow:"Sun", amHigh:[8,47,5.5], pmHigh:[10,57,4.0], amLow:[3,1,2.5], pmLow:[4,19,-0.4], rise:"7:14 AM",set:"4:51 PM",riseH:7.233,setH:16.85,dayLen:"9h 37m",moon:"full" },
  { day:7, dow:"Mon", amHigh:[9,20,5.5], pmHigh:[11,44,4.1], amLow:[3,44,2.8], pmLow:[4,55,-0.6], rise:"7:15 AM",set:"4:51 PM",riseH:7.25,setH:16.85,dayLen:"9h 36m",moon:"waning-gibbous" },
  { day:8, dow:"Tue", amHigh:[9,53,5.4], pmHigh:null, amLow:[4,26,3.0], pmLow:[5,30,-0.6], rise:"7:16 AM",set:"4:51 PM",riseH:7.267,setH:16.85,dayLen:"9h 35m",moon:"waning-gibbous" },
  { day:9, dow:"Wed", amHigh:[12,27,4.1], pmHigh:[10,26,5.3], amLow:[5,7,3.1], pmLow:[6,4,-0.6], rise:"7:17 AM",set:"4:51 PM",riseH:7.283,setH:16.85,dayLen:"9h 34m",moon:"waning-gibbous" },
  { day:10, dow:"Thu", amHigh:[1,6,4.1], pmHigh:[11,2,5.2], amLow:[5,46,3.1], pmLow:[6,39,-0.6], rise:"7:17 AM",set:"4:51 PM",riseH:7.283,setH:16.85,dayLen:"9h 34m",moon:"waning-gibbous" },
  { day:11, dow:"Fri", amHigh:[1,44,4.0], pmHigh:[11,38,5.1], amLow:[6,25,3.2], pmLow:[7,14,-0.5], rise:"7:18 AM",set:"4:51 PM",riseH:7.3,setH:16.85,dayLen:"9h 33m",moon:"waning-gibbous" },
  { day:12, dow:"Sat", amHigh:[2,20,4.0], pmHigh:[12,16,4.9], amLow:[7,7,3.1], pmLow:[7,51,-0.3], rise:"7:19 AM",set:"4:52 PM",riseH:7.317,setH:16.867,dayLen:"9h 33m",moon:"third-quarter" },
  { day:13, dow:"Sun", amHigh:[2,55,4.0], pmHigh:[12,57,4.6], amLow:[7,54,3.1], pmLow:[8,28,-0.1], rise:"7:20 AM",set:"4:52 PM",riseH:7.333,setH:16.867,dayLen:"9h 32m",moon:"third-quarter" },
  { day:14, dow:"Mon", amHigh:[3,31,4.0], pmHigh:[1,43,4.3], amLow:[8,51,3.0], pmLow:[9,7,0.1], rise:"7:20 AM",set:"4:52 PM",riseH:7.333,setH:16.867,dayLen:"9h 32m",moon:"waning-crescent" },
  { day:15, dow:"Tue", amHigh:[4,7,4.2], pmHigh:[2,38,3.9], amLow:[9,59,2.8], pmLow:[9,49,0.5], rise:"7:21 AM",set:"4:52 PM",riseH:7.35,setH:16.867,dayLen:"9h 31m",moon:"waning-crescent" },
  { day:16, dow:"Wed", amHigh:[4,43,4.3], pmHigh:[3,48,3.5], amLow:[11,11,2.4], pmLow:[10,34,0.9], rise:"7:22 AM",set:"4:53 PM",riseH:7.367,setH:16.883,dayLen:"9h 31m",moon:"waning-crescent" },
  { day:17, dow:"Thu", amHigh:[5,19,4.6], pmHigh:[5,17,3.2], amLow:[12,17,1.8], pmLow:null, rise:"7:22 AM",set:"4:53 PM",riseH:7.367,setH:16.883,dayLen:"9h 31m",moon:"waning-crescent" },
  { day:18, dow:"Fri", amHigh:[5,55,4.9], pmHigh:[6,52,3.2], amLow:[1,13,1.2], pmLow:null, rise:"7:23 AM",set:"4:53 PM",riseH:7.383,setH:16.883,dayLen:"9h 30m",moon:"waning-crescent" },
  { day:19, dow:"Sat", amHigh:[6,33,5.2], pmHigh:[8,18,3.4], amLow:[0,17,1.9], pmLow:[2,3,0.4], rise:"7:23 AM",set:"4:54 PM",riseH:7.383,setH:16.9,dayLen:"9h 31m",moon:"waning-crescent" },
  { day:20, dow:"Sun", amHigh:[7,14,5.5], pmHigh:[9,28,3.7], amLow:[1,11,2.3], pmLow:[2,51,-0.2], rise:"7:24 AM",set:"4:54 PM",riseH:7.4,setH:16.9,dayLen:"9h 30m",moon:"new" },
  { day:21, dow:"Mon", amHigh:[7,57,5.8], pmHigh:[10,27,4.0], amLow:[2,6,2.6], pmLow:[3,38,-0.8], rise:"7:24 AM",set:"4:55 PM",riseH:7.4,setH:16.917,dayLen:"9h 31m",moon:"new" },
  { day:22, dow:"Tue", amHigh:[8,44,6.1], pmHigh:[11,19,4.2], amLow:[3,0,2.8], pmLow:[4,25,-1.3], rise:"7:25 AM",set:"4:55 PM",riseH:7.417,setH:16.917,dayLen:"9h 30m",moon:"waxing-crescent" },
  { day:23, dow:"Wed", amHigh:[9,34,6.3], pmHigh:null, amLow:[3,54,2.9], pmLow:[5,13,-1.6], rise:"7:25 AM",set:"4:56 PM",riseH:7.417,setH:16.933,dayLen:"9h 31m",moon:"waxing-crescent" },
  { day:24, dow:"Thu", amHigh:[12,7,4.3], pmHigh:[10,25,6.3], amLow:[4,47,2.8], pmLow:[6,2,-1.7], rise:"7:26 AM",set:"4:56 PM",riseH:7.433,setH:16.933,dayLen:"9h 30m",moon:"waxing-crescent" },
  { day:25, dow:"Fri", amHigh:[12,53,4.4], pmHigh:[11,18,6.2], amLow:[5,43,2.7], pmLow:[6,49,-1.5], rise:"7:26 AM",set:"4:57 PM",riseH:7.433,setH:16.95,dayLen:"9h 31m",moon:"waxing-crescent" },
  { day:26, dow:"Sat", amHigh:[1,38,4.5], pmHigh:[12,12,5.8], amLow:[6,41,2.6], pmLow:[7,37,-1.2], rise:"7:27 AM",set:"4:58 PM",riseH:7.45,setH:16.967,dayLen:"9h 31m",moon:"waxing-crescent" },
  { day:27, dow:"Sun", amHigh:[2,22,4.6], pmHigh:[1,8,5.3], amLow:[7,44,2.4], pmLow:[8,24,-0.8], rise:"7:27 AM",set:"4:58 PM",riseH:7.45,setH:16.967,dayLen:"9h 31m",moon:"first-quarter" },
  { day:28, dow:"Mon", amHigh:[3,7,4.7], pmHigh:[2,8,4.7], amLow:[8,54,2.2], pmLow:[9,11,-0.2], rise:"7:27 AM",set:"4:59 PM",riseH:7.45,setH:16.983,dayLen:"9h 32m",moon:"first-quarter" },
  { day:29, dow:"Tue", amHigh:[3,52,4.8], pmHigh:[3,17,4.0], amLow:[10,11,1.9], pmLow:[9,59,0.5], rise:"7:27 AM",set:"5:00 PM",riseH:7.45,setH:17.0,dayLen:"9h 33m",moon:"waxing-gibbous" },
  { day:30, dow:"Wed", amHigh:[4,37,5.0], pmHigh:[4,41,3.5], amLow:[11,29,1.5], pmLow:[10,51,1.2], rise:"7:28 AM",set:"5:00 PM",riseH:7.467,setH:17.0,dayLen:"9h 32m",moon:"waxing-gibbous" },
  { day:31, dow:"Thu", amHigh:[5,23,5.1], pmHigh:[6,20,3.2], amLow:null, pmLow:[12,41,1.0], rise:"7:28 AM",set:"5:01 PM",riseH:7.467,setH:17.017,dayLen:"9h 33m",moon:"waxing-gibbous" },
];

const MONTH_CONFIG = {
  feb: { data: FEB_DATA, label: "February 2026", short: "Feb", days: 28, startDow: 0 },
  mar: { data: MAR_DATA, label: "March 2026", short: "Mar", days: 31, startDow: 0 },
  apr: { data: APR_DATA, label: "April 2026", short: "Apr", days: 30, startDow: 3 },
  may: { data: MAY_DATA, label: "May 2026", short: "May", days: 31, startDow: 5 },
  jun: { data: JUN_DATA, label: "June 2026", short: "Jun", days: 30, startDow: 1 },
  jul: { data: JUL_DATA, label: "July 2026", short: "Jul", days: 31, startDow: 3 },
  aug: { data: AUG_DATA, label: "August 2026", short: "Aug", days: 31, startDow: 6 },
  sep: { data: SEP_DATA, label: "September 2026", short: "Sep", days: 30, startDow: 2 },
  oct: { data: OCT_DATA, label: "October 2026", short: "Oct", days: 31, startDow: 4 },
  nov: { data: NOV_DATA, label: "November 2026", short: "Nov", days: 30, startDow: 0 },
  dec: { data: DEC_DATA, label: "December 2026", short: "Dec", days: 31, startDow: 2 },
};

// ── Helpers ──────────────────────────────────────────────────────────
function toDecH(h, m) { return h + m / 60; }

function fmtTime(h, m) {
  const suf = h >= 12 ? "PM" : "AM";
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${dh}:${String(m).padStart(2, "0")} ${suf}`;
}

const MOON = {
  "new":"\u{1F311}","waxing-crescent":"\u{1F312}","first-quarter":"\u{1F313}",
  "waxing-gibbous":"\u{1F314}","full":"\u{1F315}","waning-gibbous":"\u{1F316}",
  "third-quarter":"\u{1F317}","waning-crescent":"\u{1F318}",
};
function moonE(p) { return MOON[p] || ""; }

function buildPoints(data) {
  return data.flatMap(d => {
    const pts = [];
    const { day, amHigh, pmHigh, amLow, pmLow } = d;
    if (amLow) pts.push({ t: toDecH(amLow[0], amLow[1]), h: amLow[2], type: "low", lbl: fmtTime(amLow[0], amLow[1]) });
    if (amHigh) pts.push({ t: toDecH(amHigh[0], amHigh[1]), h: amHigh[2], type: "high", lbl: fmtTime(amHigh[0], amHigh[1]) });
    if (pmLow) { const pH = pmLow[0] < 12 ? pmLow[0]+12 : pmLow[0]; pts.push({ t: toDecH(pH, pmLow[1]), h: pmLow[2], type: "low", lbl: fmtTime(pH, pmLow[1]) }); }
    if (pmHigh) { const pH = pmHigh[0] < 12 ? pmHigh[0]+12 : pmHigh[0]; pts.push({ t: toDecH(pH, pmHigh[1]), h: pmHigh[2], type: "high", lbl: fmtTime(pH, pmHigh[1]) }); }
    pts.sort((a, b) => a.t - b.t);
    return pts.map(p => ({ x: (day-1)*24 + p.t, height: p.h, type: p.type, day, timeLabel: p.lbl }));
  });
}

function getNegTides(data) {
  return data.map(d => {
    const lows = [];
    if (d.amLow && d.amLow[2] < 0) lows.push({ time: fmtTime(d.amLow[0], d.amLow[1]), ft: d.amLow[2] });
    if (d.pmLow) { const pH = d.pmLow[0] < 12 ? d.pmLow[0]+12 : d.pmLow[0]; if (d.pmLow[2] < 0) lows.push({ time: fmtTime(pH, d.pmLow[1]), ft: d.pmLow[2] }); }
    if (!lows.length) return null;
    const best = lows.reduce((a, b) => a.ft < b.ft ? a : b);
    const tH = parseFloat(best.time) + (best.time.includes("PM") && !best.time.startsWith("12") ? 12 : 0);
    return { ...d, negLows: lows, lowestFt: best.ft, lowestTime: best.time, isDaylight: tH >= d.riseH && tH <= d.setH };
  }).filter(Boolean).sort((a, b) => a.lowestFt - b.lowestFt);
}

// ── Sub-components ───────────────────────────────────────────────────
const Tip = ({ active, payload, monthData }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const dd = monthData.find(t => t.day === d.day);
  return (
    <div style={{ background:"#1e293b", border:"1px solid #475569", borderRadius:8, padding:"10px 14px", color:"#e2e8f0", fontSize:13, boxShadow:"0 4px 12px rgba(0,0,0,0.3)" }}>
      <div style={{ fontWeight:700, marginBottom:4, color:"#93c5fd" }}>{dd?.dow} {dd?.day} — {d.timeLabel}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background: d.type==="high" ? "#60a5fa" : d.height<0 ? "#ef4444" : "#f97316" }} />
        <span style={{ fontWeight:600 }}>{d.type==="high" ? "High" : "Low"} Tide:</span>
        <span style={{ color: d.height<0 ? "#fca5a5" : "#e2e8f0" }}>{d.height.toFixed(1)} ft</span>
      </div>
      {dd && <div style={{ marginTop:6, fontSize:12, color:"#94a3b8", display:"flex", flexDirection:"column", gap:2 }}>
        <span>{moonE(dd.moon)} {dd.moon.replace("-"," ")}</span>
        <span style={{ color:"#fbbf24" }}>Sunrise {dd.rise} · Sunset {dd.set}</span>
        <span>Daylight: {dd.dayLen}</span>
      </div>}
    </div>
  );
};

const DayBar = ({ d, minT, maxT }) => {
  const span = maxT - minT;
  const left = ((d.riseH - minT) / span) * 100;
  const width = ((d.setH - d.riseH) / span) * 100;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, width:"100%" }}>
      <span style={{ fontSize:11, color:"#fbbf24", width:58, textAlign:"right", flexShrink:0 }}>{d.rise}</span>
      <div style={{ flex:1, height:12, background:"#1e293b", borderRadius:6, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", left:`${left}%`, width:`${width}%`, height:"100%", background:"linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)", borderRadius:6, opacity:0.8 }} />
      </div>
      <span style={{ fontSize:11, color:"#f59e0b", width:58, flexShrink:0 }}>{d.set}</span>
    </div>
  );
};

const DayDetail = ({ d, onClose, minT, maxT }) => {
  if (!d) return null;
  const ent = [];
  if (d.amHigh) ent.push({ l:"AM High", time:fmtTime(d.amHigh[0],d.amHigh[1]), ft:d.amHigh[2], type:"high" });
  if (d.pmHigh) { const h=d.pmHigh[0]<12?d.pmHigh[0]+12:d.pmHigh[0]; ent.push({ l:"PM High", time:fmtTime(h,d.pmHigh[1]), ft:d.pmHigh[2], type:"high" }); }
  if (d.amLow) ent.push({ l:"AM Low", time:fmtTime(d.amLow[0],d.amLow[1]), ft:d.amLow[2], type:"low" });
  if (d.pmLow) { const h=d.pmLow[0]<12?d.pmLow[0]+12:d.pmLow[0]; ent.push({ l:"PM Low", time:fmtTime(h,d.pmLow[1]), ft:d.pmLow[2], type:"low" }); }
  ent.sort((a,b) => a.time<b.time?-1:1);
  const range = Math.max(...ent.map(e=>e.ft)) - Math.min(...ent.map(e=>e.ft));
  const hasNeg = ent.some(e=>e.ft<0);
  return (
    <div style={{ background:"#1e293b", borderRadius:12, padding:20, border: hasNeg?"1px solid rgba(239,68,68,0.4)":"1px solid #334155" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:"#f1f5f9" }}>
            {d.dow}, {d.day} {moonE(d.moon)}
            {hasNeg && <span style={{ marginLeft:8, fontSize:12, background:"rgba(239,68,68,0.2)", color:"#fca5a5", padding:"2px 8px", borderRadius:4, fontWeight:600 }}>Negative Tide</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ background:"#0f172a", borderRadius:8, padding:"6px 12px", fontSize:13, color:"#60a5fa", fontWeight:600 }}>Range: {range.toFixed(1)} ft</div>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #475569", borderRadius:6, color:"#94a3b8", padding:"4px 10px", cursor:"pointer", fontSize:12 }}>Close</button>
        </div>
      </div>
      <div style={{ marginBottom:16, background:"#0f172a", borderRadius:8, padding:"10px 12px" }}>
        <div style={{ fontSize:11, color:"#94a3b8", marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Daylight — {d.dayLen}</div>
        <DayBar d={d} minT={minT} maxT={maxT} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10 }}>
        {ent.map((e,i) => (
          <div key={i} style={{ background: e.ft<0?"rgba(239,68,68,0.1)":e.type==="high"?"rgba(96,165,250,0.1)":"rgba(249,115,22,0.1)", border:`1px solid ${e.ft<0?"rgba(239,68,68,0.3)":e.type==="high"?"rgba(96,165,250,0.3)":"rgba(249,115,22,0.3)"}`, borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:600, color:e.ft<0?"#fca5a5":e.type==="high"?"#93c5fd":"#fdba74", textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{e.l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:e.ft<0?"#fca5a5":"#f1f5f9" }}>{e.ft.toFixed(1)}<span style={{ fontSize:13, fontWeight:400, color:"#94a3b8" }}> ft</span></div>
            <div style={{ fontSize:13, color:"#94a3b8", marginTop:2 }}>{e.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────
export default function TomalesBayTides() {
  const [month, setMonth] = useState("feb");
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView] = useState("month");

  const cfg = MONTH_CONFIG[month];
  const data = cfg.data;

  const allPts = useMemo(() => buildPoints(data), [data]);
  const highs = useMemo(() => allPts.filter(p => p.type === "high"), [allPts]);
  const lows = useMemo(() => allPts.filter(p => p.type === "low"), [allPts]);
  const negTides = useMemo(() => getNegTides(data), [data]);

  const numWeeks = Math.ceil(cfg.days / 7);
  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < numWeeks; i++) {
      const s = i*7+1, e = Math.min(s+6, cfg.days);
      w.push({ label:`${cfg.short} ${s}\u2013${e}`, highs:highs.filter(p=>p.day>=s&&p.day<=e), lows:lows.filter(p=>p.day>=s&&p.day<=e) });
    }
    return w;
  }, [highs, lows, numWeeks, cfg]);

  const maxHigh = Math.max(...highs.map(p=>p.height));
  const minLow = Math.min(...lows.map(p=>p.height));

  const barData = data.map(d => {
    const hs=[], ls=[];
    if(d.amHigh) hs.push(d.amHigh[2]); if(d.pmHigh) hs.push(d.pmHigh[2]);
    if(d.amLow) ls.push(d.amLow[2]); if(d.pmLow) ls.push(d.pmLow[2]);
    const mxH = hs.length?Math.max(...hs):0, mnL = ls.length?Math.min(...ls):0;
    return { day:d.day, dow:d.dow, maxHigh:mxH, minLow:mnL, range:mxH-mnL, moon:d.moon, hasNeg:mnL<0 };
  });

  // Daylight bar range (unified across all months for consistency)
  const minT = 5.5, maxT = 21.0;

  const selData = selectedDay ? data.find(d => d.day === selectedDay) : null;
  const xDomain = [0, cfg.days * 24];

  const switchMonth = (m) => { setMonth(m); setSelectedDay(null); setView("month"); };

  const downloadCSV = () => {
    const header = "Month,Day,Dow,AM High Time,AM High Ft,PM High Time,PM High Ft,AM Low Time,AM Low Ft,PM Low Time,PM Low Ft,Sunrise,Sunset,Daylight,Moon Phase";
    const rows = [];
    for (const [key, mc] of Object.entries(MONTH_CONFIG)) {
      for (const d of mc.data) {
        const fT = (arr, pm) => {
          if (!arr) return ",";
          const h = pm && arr[0] < 12 ? arr[0]+12 : arr[0];
          return `${fmtTime(h, arr[1])},${arr[2]}`;
        };
        rows.push(`${mc.short},${d.day},${d.dow},${fT(d.amHigh,false)},${fT(d.pmHigh,true)},${fT(d.amLow,false)},${fT(d.pmLow,true)},${d.rise},${d.set},${d.dayLen},${d.moon}`);
      }
    }
    const csv = header + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tomales-bay-tides-2026.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", padding:"24px 20px", fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', color:"#e2e8f0" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>

        {/* Header + Month Selector */}
        <div style={{ marginBottom:24, textAlign:"center" }}>
          <h1 style={{ fontSize:28, fontWeight:800, margin:0, background:"linear-gradient(135deg,#60a5fa,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Tomales Bay Entrance
          </h1>
          <div style={{ fontSize:13, color:"#94a3b8", marginTop:6 }}>NOAA Station 9415469 · 2026 Tide Guide</div>
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:12, flexWrap:"wrap" }}>
            {Object.entries(MONTH_CONFIG).map(([key, c]) => (
              <button key={key} onClick={() => switchMonth(key)} style={{
                padding:"7px 14px", borderRadius:8, border:"2px solid",
                borderColor: month===key ? "#60a5fa" : "#334155",
                background: month===key ? "rgba(96,165,250,0.15)" : "#1e293b",
                color: month===key ? "#93c5fd" : "#64748b",
                cursor:"pointer", fontWeight:600, fontSize:13, transition:"all 0.2s",
              }}>{c.short}</button>
            ))}
          </div>
        </div>

        {/* How to Read */}
        <div style={{ background:"rgba(96,165,250,0.06)", border:"1px solid rgba(96,165,250,0.2)", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#94a3b8", lineHeight:1.6 }}>
          <strong style={{ color:"#93c5fd" }}>How to read this chart:</strong> Look for days where the low tide drops below 0 ft during daylight. Below −1 ft is ideal for tidepooling — the lower the better. Check the time against sunrise and sunset: a −1.5 ft tide at 5 AM before sunrise isn't useful. The calendar highlights negative tide days in red, and each day's detail card shows exact tide times alongside sunrise/sunset.
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[
            { label:"Highest Tide", value:`${maxHigh.toFixed(1)} ft`, color:"#60a5fa" },
            { label:"Lowest Tide", value:`${minLow.toFixed(1)} ft`, color:"#ef4444" },
            { label:"Max Range", value:`${Math.max(...barData.map(d=>d.range)).toFixed(1)} ft`, color:"#34d399" },
            { label:"Sub-Zero Days", value:`${negTides.length}`, color:"#fbbf24" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#1e293b", borderRadius:10, padding:"14px 12px", textAlign:"center", border:"1px solid #334155" }}>
              <div style={{ fontSize:11, color:"#94a3b8", fontWeight:500, textTransform:"uppercase", letterSpacing:0.5 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:700, color:s.color, marginTop:4 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <div style={{ display:"flex", gap:6, marginBottom:16, justifyContent:"center", flexWrap:"wrap" }}>
          {[
            { key:"month", label:"Month Overview" },
            { key:"weekly", label:"Weekly Detail" },
            { key:"range", label:"Daily Range" },
            { key:"negative", label:"Best Low Tides" },
            { key:"daylight", label:"Daylight" },
          ].map(v => (
            <button key={v.key} onClick={() => { setView(v.key); setSelectedDay(null); }}
              style={{ padding:"8px 16px", borderRadius:8, border:"1px solid",
                borderColor: view===v.key ? (v.key==="negative"?"#ef4444":"#60a5fa") : "#475569",
                background: view===v.key ? (v.key==="negative"?"rgba(239,68,68,0.15)":"rgba(96,165,250,0.15)") : "#1e293b",
                color: view===v.key ? (v.key==="negative"?"#fca5a5":"#93c5fd") : "#94a3b8",
                cursor:"pointer", fontWeight:600, fontSize:13, transition:"all 0.2s",
              }}>{v.label}</button>
          ))}
        </div>

        {/* Month Overview */}
        {view==="month" && (
          <div style={{ background:"#1e293b", borderRadius:12, padding:"16px 12px 8px", border:"1px solid #334155", marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#94a3b8", marginBottom:8, paddingLeft:8 }}>Full Month — click any point for details</div>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart margin={{ top:10, right:16, left:0, bottom:10 }}>
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05}/></linearGradient>
                  <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="100%" stopColor="#f97316" stopOpacity={0.05}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="x" type="number" domain={xDomain}
                  ticks={Array.from({length:cfg.days},(_,i)=>i*24+12)}
                  tickFormatter={v=>{ const d=Math.floor(v/24)+1; return d<=cfg.days?`${d}`:""; }}
                  stroke="#64748b" tick={{ fontSize:11, fill:"#94a3b8" }}
                  label={{ value:cfg.label, position:"insideBottom", offset:-4, fontSize:12, fill:"#64748b" }}
                />
                <YAxis domain={[-2.0,6.5]} stroke="#64748b" tick={{ fontSize:11, fill:"#94a3b8" }}
                  label={{ value:"Height (ft)", angle:-90, position:"insideLeft", fontSize:12, fill:"#64748b" }}
                />
                <Tooltip content={<Tip monthData={data}/>}/>
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.6}/>
                <Area data={highs} dataKey="height" type="monotone" fill="url(#hg)" stroke="#60a5fa" strokeWidth={2}
                  dot={{ r:3, fill:"#60a5fa", stroke:"#1e293b", strokeWidth:1 }}
                  activeDot={{ r:6, fill:"#93c5fd", stroke:"#1e293b", strokeWidth:2, onClick:(_,e)=>setSelectedDay(e?.payload?.day) }}
                />
                <Area data={lows} dataKey="height" type="monotone" fill="url(#lg)" stroke="#f97316" strokeWidth={2}
                  dot={props=>{ const {cx,cy,payload}=props; const neg=payload.height<0; return <circle key={`d${payload.x}`} cx={cx} cy={cy} r={neg?5:3} fill={neg?"#ef4444":"#f97316"} stroke={neg?"#fca5a5":"#1e293b"} strokeWidth={neg?2:1}/>; }}
                  activeDot={{ r:6, fill:"#fdba74", stroke:"#1e293b", strokeWidth:2, onClick:(_,e)=>setSelectedDay(e?.payload?.day) }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", justifyContent:"center", gap:20, paddingBottom:4, fontSize:12 }}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ width:10,height:10,borderRadius:"50%",background:"#60a5fa",display:"inline-block" }}/> High</span>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ width:10,height:10,borderRadius:"50%",background:"#f97316",display:"inline-block" }}/> Low</span>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ width:10,height:10,borderRadius:"50%",background:"#ef4444",display:"inline-block" }}/> Below 0 ft</span>
            </div>
          </div>
        )}

        {/* Weekly */}
        {view==="weekly" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:16 }}>
            {weeks.map((w,wi) => (
              <div key={wi} style={{ background:"#1e293b", borderRadius:12, padding:"14px 12px 6px", border:"1px solid #334155" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#93c5fd", marginBottom:6, paddingLeft:8 }}>{w.label}</div>
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart margin={{ top:8, right:16, left:0, bottom:4 }}>
                    <defs>
                      <linearGradient id={`hg${wi}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05}/></linearGradient>
                      <linearGradient id={`lg${wi}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="100%" stopColor="#f97316" stopOpacity={0.05}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                    <XAxis dataKey="x" type="number" domain={[wi*7*24,(wi+1)*7*24]}
                      ticks={Array.from({length:7},(_,i)=>(wi*7+i)*24+12)}
                      tickFormatter={v=>{ const d=Math.floor(v/24)+1; const dd=data.find(t=>t.day===d); return dd?`${dd.dow} ${d}`:`${d}`; }}
                      stroke="#64748b" tick={{ fontSize:11, fill:"#94a3b8" }}
                    />
                    <YAxis domain={[-2.0,6.5]} stroke="#64748b" tick={{ fontSize:11, fill:"#94a3b8" }}/>
                    <Tooltip content={<Tip monthData={data}/>}/>
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.5}/>
                    <Area data={w.highs} dataKey="height" type="monotone" fill={`url(#hg${wi})`} stroke="#60a5fa" strokeWidth={2}
                      dot={{ r:4, fill:"#60a5fa", stroke:"#1e293b", strokeWidth:1 }}
                      activeDot={{ r:6, fill:"#93c5fd", stroke:"#1e293b", strokeWidth:2, onClick:(_,e)=>setSelectedDay(e?.payload?.day) }}
                    />
                    <Area data={w.lows} dataKey="height" type="monotone" fill={`url(#lg${wi})`} stroke="#f97316" strokeWidth={2}
                      dot={props=>{ const {cx,cy,payload}=props; const neg=payload.height<0; return <circle key={`w${payload.x}`} cx={cx} cy={cy} r={neg?5:4} fill={neg?"#ef4444":"#f97316"} stroke={neg?"#fca5a5":"#1e293b"} strokeWidth={neg?2:1}/>; }}
                      activeDot={{ r:6, fill:"#fdba74", stroke:"#1e293b", strokeWidth:2, onClick:(_,e)=>setSelectedDay(e?.payload?.day) }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        {/* Daily Range */}
        {view==="range" && (
          <div style={{ background:"#1e293b", borderRadius:12, padding:"16px 12px 8px", border:"1px solid #334155", marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#94a3b8", marginBottom:8, paddingLeft:8 }}>Daily Tide Range — click for details</div>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={barData} margin={{ top:10, right:16, left:0, bottom:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize:11, fill:"#94a3b8" }} label={{ value:cfg.label, position:"insideBottom", offset:-4, fontSize:12, fill:"#64748b" }}/>
                <YAxis domain={[-2.0,6.5]} stroke="#64748b" tick={{ fontSize:11, fill:"#94a3b8" }} label={{ value:"Height (ft)", angle:-90, position:"insideLeft", fontSize:12, fill:"#64748b" }}/>
                <Tooltip content={({active,payload})=>{
                  if(!active||!payload?.length) return null;
                  const d=payload[0].payload, dd=data.find(t=>t.day===d.day);
                  return (<div style={{ background:"#1e293b", border:"1px solid #475569", borderRadius:8, padding:"10px 14px", color:"#e2e8f0", fontSize:13 }}>
                    <div style={{ fontWeight:700, color:"#93c5fd" }}>{d.dow} {d.day} {moonE(d.moon)}</div>
                    <div><span style={{ color:"#60a5fa" }}>High:</span> {d.maxHigh.toFixed(1)} ft</div>
                    <div><span style={{ color:d.minLow<0?"#ef4444":"#f97316" }}>Low:</span> {d.minLow.toFixed(1)} ft</div>
                    <div><span style={{ color:"#34d399" }}>Range:</span> {d.range.toFixed(1)} ft</div>
                    {dd&&<div style={{ marginTop:4, fontSize:12, color:"#fbbf24" }}>Sunrise {dd.rise} · Sunset {dd.set}</div>}
                  </div>);
                }}/>
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.5}/>
                <Bar dataKey="maxHigh" fill="#60a5fa" radius={[4,4,0,0]} opacity={0.7} onClick={d=>setSelectedDay(d.day)} style={{ cursor:"pointer" }}/>
                <Bar dataKey="minLow" fill="#f97316" radius={[4,4,0,0]} opacity={0.7} onClick={d=>setSelectedDay(d.day)} style={{ cursor:"pointer" }}/>
                <Line dataKey="range" stroke="#34d399" strokeWidth={2} dot={{ r:3, fill:"#34d399" }}/>
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", justifyContent:"center", gap:20, paddingBottom:4, fontSize:12 }}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ width:10,height:10,borderRadius:2,background:"#60a5fa",display:"inline-block" }}/> Max High</span>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ width:10,height:10,borderRadius:2,background:"#f97316",display:"inline-block" }}/> Min Low</span>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ width:10,height:3,background:"#34d399",display:"inline-block" }}/> Range</span>
            </div>
          </div>
        )}

        {/* Best Low Tides */}
        {view==="negative" && (
          <div style={{ background:"#1e293b", borderRadius:12, padding:20, border:"1px solid rgba(239,68,68,0.3)", marginBottom:16 }}>
            <div style={{ fontSize:16, fontWeight:700, color:"#fca5a5", marginBottom:4 }}>Best Low Tides — Below 0 ft</div>
            <div style={{ fontSize:13, color:"#94a3b8", marginBottom:16 }}>
              {negTides.length} days ranked by lowest height — ideal for tidepooling
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {negTides.map((d,i) => {
                const top = i < 3;
                return (
                  <button key={d.day} onClick={()=>setSelectedDay(d.day)} style={{
                    display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
                    background: top ? "rgba(239,68,68,0.08)" : "#0f172a",
                    border: top ? "1px solid rgba(239,68,68,0.3)" : "1px solid #334155",
                    borderRadius:10, cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s",
                  }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                      background: top ? "rgba(239,68,68,0.2)" : "rgba(100,116,139,0.2)",
                      color: top ? "#fca5a5" : "#94a3b8", fontWeight:800, fontSize:14,
                    }}>{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:"#f1f5f9", fontSize:15 }}>{d.dow}, {cfg.short} {d.day} {moonE(d.moon)}</div>
                      <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{d.negLows.map(l=>`${l.ft.toFixed(1)} ft at ${l.time}`).join(" · ")}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:22, fontWeight:800, color:"#ef4444" }}>{d.lowestFt.toFixed(1)}<span style={{ fontSize:12, fontWeight:400 }}> ft</span></div>
                      <div style={{ fontSize:11, color:d.isDaylight?"#34d399":"#fbbf24", marginTop:2 }}>{d.isDaylight?"During daylight":"Near sunset"}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {month === "mar" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> March 21–24 have rare <em>morning</em> negative tides (8–11 AM) — perfect daylight conditions. Late month (25–29) shifts to afternoon lows.
              </div>
            )}
            {month === "feb" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> Feb 1–3 have the deepest negative tides near sunset. Feb 27–28 offer mid-afternoon lows with more daylight remaining.
              </div>
            )}
            {month === "apr" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> April 17–23 is an exceptional 7-day stretch of morning negative tides (6–noon), peaking at −1.2 ft on Apr 19–20. Early month (4–5) also dips negative around 8 AM.
              </div>
            )}
            {month === "may" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> May 16–21 brings extreme morning negative tides (6–8 AM), bottoming at −1.7 ft on May 17. Early sunrise means excellent daylight conditions for tidepooling.
              </div>
            )}
            {month === "jun" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> June 12–17 is the deepest negative stretch of the year, reaching −1.7 ft on Jun 15–16. Peak daylight (14h 48m+) with early 5:47 AM sunrise makes these ideal.
              </div>
            )}
            {month === "jul" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> July 12–17 has deep morning negative tides (5–8 AM), reaching −1.5 ft on Jul 13. Long daylight hours with sunrise before 6 AM.
              </div>
            )}
            {month === "aug" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> August 10–14 features the best negative tides, with −1.3 ft on Aug 12. Morning lows shift later (5–7 AM) as summer wanes.
              </div>
            )}
            {month === "sep" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> September negative tides cluster around the 9th–12th (morning, reaching −0.7 ft). Less extreme than summer but still good conditions with moderate daylight.
              </div>
            )}
            {month === "oct" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> October negative tides are modest, peaking around −0.4 ft on Oct 10–11. Afternoon lows near 3–4 PM still have good daylight before DST ends.
              </div>
            )}
            {month === "nov" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> November negative tides concentrate around the 2nd–6th with afternoon lows. After DST ends Nov 1, sunset comes early (~5 PM), so timing is critical.
              </div>
            )}
            {month === "dec" && (
              <div style={{ marginTop:16, padding:"12px 16px", background:"#0f172a", borderRadius:8, fontSize:13, color:"#94a3b8" }}>
                <strong style={{ color:"#fbbf24" }}>Tip:</strong> December has deep morning negative tides around the 12th–15th (reaching −1.7 ft on Dec 13) and end of month (27–31). Short daylight means early morning lows happen near dawn.
              </div>
            )}
          </div>
        )}

        {/* Daylight */}
        {view==="daylight" && (
          <div style={{ background:"#1e293b", borderRadius:12, padding:20, border:"1px solid #334155", marginBottom:16 }}>
            <div style={{ fontSize:16, fontWeight:700, color:"#fbbf24", marginBottom:4 }}>Daylight Hours</div>
            <div style={{ fontSize:13, color:"#94a3b8", marginBottom:16 }}>
              {data[0].dayLen} → {data[data.length-1].dayLen} through the month
              {month==="mar" && <span style={{ color:"#f59e0b" }}> · DST begins Mar 8</span>}
              {month==="nov" && <span style={{ color:"#f59e0b" }}> · DST ends Nov 1</span>}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {data.map(d => {
                const hasNeg = (d.pmLow&&d.pmLow[2]<0)||(d.amLow&&d.amLow[2]<0);
                return (
                  <button key={d.day} onClick={()=>setSelectedDay(d.day)} style={{
                    display:"flex", alignItems:"center", gap:8, padding:"6px 10px",
                    background: hasNeg ? "rgba(239,68,68,0.05)" : "transparent",
                    border: selectedDay===d.day ? "1px solid #fbbf24" : "1px solid transparent",
                    borderRadius:6, cursor:"pointer", width:"100%", textAlign:"left",
                  }}>
                    <div style={{ width:60, fontSize:12, color:hasNeg?"#fca5a5":"#94a3b8", fontWeight:600, flexShrink:0 }}>{d.dow} {d.day}</div>
                    <div style={{ flex:1 }}><DayBar d={d} minT={minT} maxT={maxT}/></div>
                    <div style={{ width:58, fontSize:11, color:"#64748b", textAlign:"right", flexShrink:0 }}>{d.dayLen}</div>
                    {hasNeg && <span style={{ fontSize:10, color:"#ef4444", fontWeight:700, flexShrink:0, width:12 }}>*</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop:12, fontSize:12, color:"#64748b" }}><span style={{ color:"#ef4444" }}>*</span> = day has negative tide</div>
          </div>
        )}

        {/* Day Detail */}
        {selectedDay && (
          <div style={{ marginBottom:16, marginTop:8 }}>
            <DayDetail d={selData} onClose={()=>setSelectedDay(null)} minT={minT} maxT={maxT}/>
          </div>
        )}

        {/* Calendar */}
        <div style={{ background:"#1e293b", borderRadius:12, padding:16, border:"1px solid #334155", marginTop:8 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#94a3b8", marginBottom:12 }}>Tap a day for details</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} style={{ textAlign:"center", fontSize:11, color:"#64748b", fontWeight:600, paddingBottom:4 }}>{d}</div>
            ))}
            {/* Empty cells at start of month */}
            {Array.from({ length: cfg.startDow }).map((_,i) => (
              <div key={`start-${i}`} style={{ borderRadius:8, padding:"6px 4px" }}/>
            ))}
            {data.map(d => {
              const ls = [];
              if(d.amLow) ls.push(d.amLow[2]); if(d.pmLow) ls.push(d.pmLow[2]);
              const mnL = ls.length ? Math.min(...ls) : 0;
              const neg = mnL < 0;
              return (
                <button key={d.day} onClick={()=>setSelectedDay(d.day)} style={{
                  background: selectedDay===d.day ? "rgba(96,165,250,0.3)" : neg ? "rgba(239,68,68,0.1)" : "rgba(96,165,250,0.05)",
                  border: selectedDay===d.day ? "1px solid #60a5fa" : neg ? "1px solid rgba(239,68,68,0.3)" : "1px solid #334155",
                  borderRadius:8, padding:"6px 4px", cursor:"pointer", textAlign:"center", transition:"all 0.15s",
                }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0" }}>{d.day}</div>
                  <div style={{ fontSize:10, color:neg?"#ef4444":"#94a3b8", marginTop:1, fontWeight:neg?700:400 }}>{mnL.toFixed(1)}</div>
                  <div style={{ fontSize:9, marginTop:1 }}>{moonE(d.moon)}</div>
                </button>
              );
            })}
            {/* Fill empty cells at end of month */}
            {Array.from({ length: (7 - ((cfg.days + cfg.startDow) % 7)) % 7 }).map((_,i) => (
              <div key={`empty-${i}`} style={{ borderRadius:8, padding:"6px 4px" }}/>
            ))}
          </div>
          <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:10, fontSize:11, color:"#64748b" }}>
            <span><span style={{ display:"inline-block", width:8, height:8, borderRadius:2, background:"rgba(239,68,68,0.3)", marginRight:4, verticalAlign:"middle" }}/>Negative tide day</span>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:12, marginTop:16 }}>
          <span style={{ fontSize:11, color:"#475569" }}>Data: USHarbors.com · Tomales Bay entrance, CA</span>
          <button onClick={downloadCSV} style={{
            padding:"5px 12px", borderRadius:6, border:"1px solid #334155", background:"#1e293b",
            color:"#94a3b8", cursor:"pointer", fontSize:11, fontWeight:600, transition:"all 0.2s",
            display:"flex", alignItems:"center", gap:4,
          }}>
            <span style={{ fontSize:13 }}>&#8595;</span> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}