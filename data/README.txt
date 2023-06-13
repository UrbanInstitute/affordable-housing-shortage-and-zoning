
--- RAW DATA -------------------
Jurisdictions:
	- Yonah shared shape files for all jurisdictions. Next, the shape file was loaded in QGIS and Vector > Data Management Tools > Split Vector Layer tool was used to export separate geojson files for each jurisdiction, using the GISJOIN field as the name. 
	- QGIS was also used to compute and export a geojson file of centroids for each jurisdiction

Tracts:
	- Aleszu used an R script to produce geojson files for each jurisdiction (with Yonah's data as the original source files). Each file contains all of the census tracts that fall within that jurisdiction

Stations:
	- Aleszu used an R script to produce geojson files for each jurisdiction (with Yonah's data as the original source files). Each file contains all of the stations that fall within that jurisdiction

Transit lines:
	- Yonah shared shape files for all transit lines across the region. To split those by jurisdiction, I used QGIS and:
		- loaded the jurisdictions shape file ("places") and the transit shape file
		- used Vector > Geoprocessing Tools > Intersection, with input layer = transit and overlay layer = places, to create a new layer with transit lines split by jurisdiction
		- then used Vector > Data Management Tools > Split Vector Layer with GISJOIN as the Unique ID field to export GEOJSON versions of the files to <repo>/data/raw/transit