# seqdisp-jbrowse
## About
seqdisp-jbrowse is a JBrowse plugin that adds a menu to the right-click context menus of
a JBrowse track that allows users to view supplied bases upstream and downstream of the
currently selected feature. It has been tested to work with HTML and Canvas feature style
tracks, but in theory should work with any of the JBrowse track formats.

## Setup
Copy the contents of the src folder into the src folder on your jbrowse instance.
Enable the plugin in your jbrowse.conf.
Configure the right-click menu for the track you wish to add this plugin to:
(See: http://gmod.org/wiki/JBrowse_Configuration_Guide#Customizing_Right-click_Context_Menus )

### Example config for tracks.conf format
```
menuTemplate += json:{"label" : "View details"}
menuTemplate += json:{"label" : "Zoom to this transcript"} 
menuTemplate += json:{"label" : "Highlight this transcript"} 
menuTemplate += json:{"label" : "Sequence Viewer", "title" : "Sequence Viewer", "iconClass" : "dijitIconDatabase","action": "contentDialog","content" : "function(track,feature,div){return SeqDisp(track,feature,div);}"}
```
### Example config for trackList.json format
```
 {
"iconClass" : "dijitIconDatabase",
"content" : "function(track,feature,div ){ return SeqDisp(track,feature,div)}",
"action" : "contentDialog",
"label" : "View Sequence"
}
```
The plugin should now work


Development supported by the USDA-ARS, 
Corn Insects and Crop Genomics Research Unit.
