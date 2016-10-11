
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);  
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseDSX(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};



/*
 * Parses elements of one block and stores information in a specific data structure
 */

/*
TODO Check IDS
	 material/materials
*/


MySceneGraph.prototype.parseDSX= function(rootElement) {
	console.log("======================================================================");
	console.log("SCENE");
	var elems =  rootElement.getElementsByTagName("scene");
	var error = this.checkElem(elems, "scene");
	if (error != null) {return error;}
	
	var root = this.reader.getString(elems[0], "root", false);
	var axis_length = this.reader.getFloat(elems[0], "axis_length", false);

	console.log("Scene root="+root+"; Axis_length="+axis_length);

	console.log("======================================================================");
	console.log("VIEWS");
	elems = rootElement.getElementsByTagName("views");
	error = this.checkElem(elems, "views");
	if (error != null) {return error;}
	
	var default_view = this.reader.getString(elems[0], "default", false);

	console.log("Default view="+default_view);
	

	console.log("perpective");
	var subelems = elems[0].getElementsByTagName("perspective");
	for (var i = 0; i < subelems.length; i++) {
		var id = this.reader.getString(subelems[i],"id",false);
		var near = this.reader.getFloat(subelems[i],"near",false);
		var far = this.reader.getFloat(subelems[i],"far",false);
		var angle = this.reader.getFloat(subelems[i],"angle",false);

		var from = subelems[i].getElementsByTagName("from");
		error = this.checkElem(from, "from");
		if (error != null) {return error;}
		var coord1 = [];
		this.readXYZ(from[0],coord1);

		var to = subelems[i].getElementsByTagName("to");
		error = this.checkElem(to, "to");
		if (error != null) {return error;}
		var coord2 = [];
		this.readXYZ(to[0],coord2);

		console.log(id+", "+near+", "+far+", "+angle);
		console.log(coord1[0]+", "+coord1[1]+", "+coord1[2]);
		console.log(coord2[0]+", "+coord2[1]+", "+coord2[2]);
	}
	
	console.log("======================================================================");
	console.log("ILLUMINATION");
	elems = rootElement.getElementsByTagName("illumination");
	error = this.checkElem(elems, "illumination");
	if (error != null) {return error;}

	var doublesided = this.reader.getBoolean(elems[0],"doublesided",false);
	var local = this.reader.getBoolean(elems[0],"local",false);

	var ambient = elems[0].getElementsByTagName("ambient");
	error = this.checkElem(ambient, "ambient");
	if (error != null) {return error;}
	var vala = [];
	this.readRGBA(ambient[0],vala);

	var background = elems[0].getElementsByTagName("background");
	error = this.checkElem(background, "background");
	if (error != null) {return error;}
	var valb = [];
	this.readRGBA(background[0],valb);
	

	console.log(doublesided+", "+local);
	console.log("ambient "+vala[0]+", "+vala[1]+", "+vala[2]+", "+vala[3]);
	console.log("background "+valb[0]+", "+valb[1]+", "+valb[2]+", "+valb[3]);


	console.log("======================================================================");
	console.log("LIGHTS");
	elems = rootElement.getElementsByTagName("lights");
	error = this.checkElem(elems, "lights");
	if (error != null) {return error;}

	console.log("omni");	
	var subelems = elems[0].getElementsByTagName("omni");
	for (var i = 0; i < subelems.length; i++) {
		var id = this.reader.getString(subelems[i],"id",false);
		var enabled = this.reader.getBoolean(subelems[i],"enabled",false);

		var location = subelems[i].getElementsByTagName("location");
		error = this.checkElem(location, "location");
		if (error != null) {return error;}
		var coord = [];
		this.readXYZ(location[0],coord);

		var ambient = subelems[i].getElementsByTagName("ambient");
		error = this.checkElem(ambient, "ambient");
		if (error != null) {return error;}
		var vala = [];
		this.readRGBA(ambient[0],vala);

		var diffuse = subelems[i].getElementsByTagName("diffuse");
		error = this.checkElem(diffuse, "diffuse");
		if (error != null) {return error;}
		var vald = [];
		this.readRGBA(diffuse[0],vald);

		var specular = subelems[i].getElementsByTagName("specular");
		error = this.checkElem(specular, "specular");
		if (error != null) {return error;}
		var vals = [];
		this.readRGBA(specular[0],vals);		

		console.log(id+", "+enabled);
		console.log("location "+coord[0]+", "+coord[1]+", "+coord[2]);
		console.log("ambient "+vala[0]+", "+vala[1]+", "+vala[2]+", "+vala[3]);
		console.log("diffuse "+vald[0]+", "+vald[1]+", "+vald[2]+", "+vald[3]);;
		console.log("specular "+vals[0]+", "+vals[1]+", "+vals[2]+", "+vals[3]);
	}

	console.log("spot");	
	var subelems = elems[0].getElementsByTagName("spot");
	for (var i = 0; i < subelems.length; i++) {
		var id = this.reader.getString(subelems[i],"id",false);
		var enabled = this.reader.getBoolean(subelems[i],"enabled",false);
		var angle = this.reader.getFloat(subelems[i],"angle", false);
		var exponent = this.reader.getFloat(subelems[i],"exponent", false);
		
		var target = subelems[i].getElementsByTagName("target");
		error = this.checkElem(target, "target");
		if (error != null) {return error;}
		var coord1 = [];
		this.readXYZ(target[0],coord1);

		var location = subelems[i].getElementsByTagName("location");
		error = this.checkElem(location, "location");
		if (error != null) {return error;}
		var coord2 = [];
		this.readXYZ(location[0],coord2);

		var ambient = subelems[i].getElementsByTagName("ambient");
		error = this.checkElem(ambient, "ambient");
		if (error != null) {return error;}
		var vala = [];
		this.readRGBA(ambient[0],vala);

		var diffuse = subelems[i].getElementsByTagName("diffuse");
		error = this.checkElem(diffuse, "diffuse");
		if (error != null) {return error;}
		var vald = [];
		this.readRGBA(diffuse[0],vald);

		var specular = subelems[i].getElementsByTagName("specular");
		error = this.checkElem(specular, "specular");
		if (error != null) {return error;}
		var vals = [];
		this.readRGBA(specular[0],vals);		

		console.log(id, enabled, angle, exponent);
		console.log("target "+coord1[0]+", "+coord1[1]+", "+coord1[2]);
		console.log("location "+coord2[0]+", "+coord2[1]+", "+coord2[2]);
		console.log("ambient "+vala[0]+", "+vala[1]+", "+vala[2]+", "+vala[3]);
		console.log("diffuse "+vald[0]+", "+vald[1]+", "+vald[2]+", "+vald[3]);;
		console.log("specular "+vals[0]+", "+vals[1]+", "+vals[2]+", "+vals[3]);
	}
	

	console.log("======================================================================");
	console.log("TEXTURES");

	elems = rootElement.getElementsByTagName("textures");
	error = this.checkElem(elems, "textures");
	if (error != null) {return error;}

	var subelems = elems[0].getElementsByTagName("texture");
	for (var i = 0; i < subelems.length; i++) {
		var id = this.reader.getString(subelems[i],"id",false);
		var file = this.reader.getString(subelems[i],"file",false);
		var length_s = this.reader.getFloat(subelems[i],"length_s", false);
		var length_t = this.reader.getFloat(subelems[i],"length_t", false);

		console.log(id, file, length_s, length_t);
	}


	console.log("======================================================================");
	console.log("MATERIALS");

	elems = rootElement.getElementsByTagName("materials");
	error = this.checkElem(elems, "materials");
	if (error != null) {return error;}

	var subelems = elems[0].getElementsByTagName("material");
	for (var i = 0; i < subelems.length; i++) {
		var id = this.reader.getString(subelems[i],"id",false);
		
		var emission = subelems[i].getElementsByTagName("emission");
		error = this.checkElem(emission, "emission");
		if (error != null) {return error;}
		var vale = [];
		this.readRGBA(emission[0],vale);

		var ambient = subelems[i].getElementsByTagName("ambient");
		error = this.checkElem(ambient, "ambient");
		if (error != null) {return error;}
		var vala = [];
		this.readRGBA(ambient[0],vala);

		var diffuse = subelems[i].getElementsByTagName("diffuse");
		error = this.checkElem(diffuse, "diffuse");
		if (error != null) {return error;}
		var vald = [];
		this.readRGBA(diffuse[0],vald);

		var specular = subelems[i].getElementsByTagName("specular");
		error = this.checkElem(specular, "specular");
		if (error != null) {return error;}
		var vals = [];
		this.readRGBA(specular[0],vals);

		var shininess = subelems[i].getElementsByTagName("shininess");
		error = this.checkElem(shininess, "shininess");
		if (error != null) {return error;}
		var shininess_value = this.reader.getFloat(shininess[0], "value", false);

		console.log(id);
		console.log("target "+coord1[0]+", "+coord1[1]+", "+coord1[2]);
		console.log("location "+coord2[0]+", "+coord2[1]+", "+coord2[2]);
		console.log("ambient "+vala[0]+", "+vala[1]+", "+vala[2]+", "+vala[3]);
		console.log("diffuse "+vald[0]+", "+vald[1]+", "+vald[2]+", "+vald[3]);;
		console.log("specular "+vals[0]+", "+vals[1]+", "+vals[2]+", "+vals[3]);
	}


	console.log("======================================================================");
	console.log("TRANSFORMATIONS");

	elems = rootElement.getElementsByTagName("transformations");
	error = this.checkElem(elems, "transformations");
	if (error != null) {return error;}

	var subelems = elems[0].getElementsByTagName("transformation");
	for (var i = 0; i < subelems.length; i++) {
		var id = this.reader.getString(subelems[i],"id",false);

		var translate = subelems[i].getElementsByTagName("translate");
		error = this.checkElem(translate, "translate");
		if (error != null) {return error;}
		var coord1 = [];
		this.readXYZ(translate[0],coord1);

		var rotate = subelems[i].getElementsByTagName("rotate");
		error = this.checkElem(rotate, "rotate");
		if (error != null) {return error;}
		var axis = this.reader.getString(rotate[0],"axis",false);
		var angle = this.reader.getFloat(rotate[0],"angle",false);

		var scale = subelems[i].getElementsByTagName("scale");
		error = this.checkElem(scale, "scale");
		if (error != null) {return error;}
		var coord2 = [];
		this.readXYZ(scale[0],coord2);

		console.log(id);
		console.log("translate "+coord1[0]+", "+coord1[1]+", "+coord1[2]);
		console.log("rotate "+axis+", "+angle);
		console.log("scale "+coord2[0]+", "+coord2[1]+", "+coord2[2]);
		
	}


	console.log("======================================================================");
	console.log("PRIMITIVES");

	elems = rootElement.getElementsByTagName("primitives");
	error = this.checkElem(elems, "primitives");
	if (error != null) {return error;}

	var subelems = elems[0].getElementsByTagName("primitive");
	for (var i = 0; i < subelems.length; i++) {
		var id = this.reader.getString(subelems[i],"id",false);

		var rectangle = subelems[i].getElementsByTagName("rectangle");
		error = this.checkElem(rectangle, "rectangle");
		if (error != null) {return error;}
		var x1 = this.reader.getFloat(rectangle[0], "x1", false);
		var y1 = this.reader.getFloat(rectangle[0], "y1", false);
		var x2 = this.reader.getFloat(rectangle[0], "x2", false);
		var y2 = this.reader.getFloat(rectangle[0], "y2", false);
		
		console.log(id);
		console.log("rectangle "+x1+", "+y1+", "+x2+", "+y2);

		var triangle = subelems[i].getElementsByTagName("triangle");
		error = this.checkElem(triangle, "triangle");
		if (error != null) {return error;}
		var x1 = this.reader.getFloat(triangle[0], "x1", false);
		var y1 = this.reader.getFloat(triangle[0], "y1", false);
		var z1 = this.reader.getFloat(triangle[0], "z1", false);
		var x2 = this.reader.getFloat(triangle[0], "x2", false);
		var y2 = this.reader.getFloat(triangle[0], "y2", false);
		var z2 = this.reader.getFloat(triangle[0], "z2", false);
		var x3 = this.reader.getFloat(triangle[0], "x3", false);
		var y3 = this.reader.getFloat(triangle[0], "y3", false);
		var z3 = this.reader.getFloat(triangle[0], "z3", false);
		
		console.log("triangle "+x1+", "+y1+", "+z1+", "+x2+", "+y2+", "+z2+", "+x3+", "+y3+", "+z3);


		var cylinder = subelems[i].getElementsByTagName("cylinder");
		error = this.checkElem(cylinder, "cylinder");
		if (error != null) {return error;}
		var base = this.reader.getFloat(cylinder[0], "base", false);
		var top = this.reader.getFloat(cylinder[0], "top", false);
		var height = this.reader.getFloat(cylinder[0], "height", false);
		var slices = this.reader.getFloat(cylinder[0], "slices", false);
		var stacks = this.reader.getFloat(cylinder[0], "stacks", false);
		
		console.log("cylinder "+base+", "+top+", "+height+", "+slices+", "+stacks);


		var sphere = subelems[i].getElementsByTagName("sphere");
		error = this.checkElem(sphere, "sphere");
		if (error != null) {return error;}
		var radius = this.reader.getFloat(sphere[0], "radius", false);
		var slices = this.reader.getFloat(sphere[0], "slices", false);
		var stacks = this.reader.getFloat(sphere[0], "stacks", false);
		
		console.log("sphere "+radius+", "+slices+", "+stacks);
		


		var torus = subelems[i].getElementsByTagName("torus");
		error = this.checkElem(torus, "torus");
		if (error != null) {return error;}
		var inner = this.reader.getFloat(torus[0], "inner", false);
		var outer = this.reader.getFloat(torus[0], "outer", false);
		var slices = this.reader.getFloat(torus[0], "slices", false);
		var loops = this.reader.getFloat(torus[0], "loops", false);
		
		console.log("torus "+inner+", "+outer+", "+slices+", "+loops);
	}


	console.log("======================================================================");
	console.log("COMPONENTS");

	elems = rootElement.getElementsByTagName("components");
	error = this.checkElem(elems, "components");
	if (error != null) {return error;}

	var subelems = elems[0].getElementsByTagName("component");
	for (var i = 0; i < subelems.length; i++) {
		var id = this.reader.getString(subelems[i],"id",false);

		// transformation

		// material

		// texture

		// children
		
	}

};

/*
Checks if the elems structure is empty or has more than one tag
*/

MySceneGraph.prototype.checkElem= function(elems, name) {
	if (elems == null) {
		return name+" element is missing.";
	}
	
	if (elems.length != 1) {
		return "either zero or more than one "+name+" element found.";
	}
		
	return null;
}

/*
Read x,y,z
*/
MySceneGraph.prototype.readXYZ= function(node,coord) {
	coord[0] = this.reader.getFloat(node,"x", false);
	coord[1] = this.reader.getFloat(node,"y", false);
	coord[2] = this.reader.getFloat(node,"z", false);
}

/*
Read r,g,b,a
*/
MySceneGraph.prototype.readRGBA= function(node,val) {
	val[0] = this.reader.getFloat(node,"r", false);
	val[1] = this.reader.getFloat(node,"g", false);
	val[2] = this.reader.getFloat(node,"b", false);
	val[3] = this.reader.getFloat(node,"a", false);
}

	
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};


