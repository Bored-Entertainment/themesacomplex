var BiomeDryDesert = {
    CourseScaleCompression: 0.003,
    CourseScaleHeight: 4,
    FineScaleCompression: 0.004,
    FineScaleHeight: 2,
    Offset: 8,
    SurfaceBlock: 5,
    SubsurfaceBlock: 5,
    LiquidBlock: 0
};

var BiomePlains = {
    CourseScaleCompression: 0.006,
    CourseScaleHeight: 5,
    FineScaleCompression: 0.008,
    FineScaleHeight: 1,
    Offset: 8,
    SurfaceBlock: 3,
    SubsurfaceBlock: 2,
    LiquidBlock: 4
};

var BiomeForest = {
    CourseScaleCompression: 0.005,
    CourseScaleHeight: 16,
    FineScaleCompression: 0.01,
    FineScaleHeight: 2,
    Offset: 4,
    SurfaceBlock: 3,
    SubsurfaceBlock: 2,
    LiquidBlock: 4
};

var BiomeMountains = {
	CourseScaleCompression: 0.01,
    CourseScaleHeight: 32,
    FineScaleCompression: 0.05,
    FineScaleHeight: 6,
    Offset: 14,
    SurfaceBlock: 1,
    SubsurfaceBlock: 1,
    LiquidBlock: 4
};

var BiomeHills = {
    CourseScaleCompression: 0.02,
    CourseScaleHeight: 15,
    FineScaleCompression: 0.025,
    FineScaleHeight: 3,
    Offset: 6,
    SurfaceBlock: 3,
    SubsurfaceBlock: 2,
    LiquidBlock: 4
};

var BiomeLushDesert = {
    CourseScaleCompression: 0.007,
    CourseScaleHeight: 4,
    FineScaleCompression: 0.01,
    FineScaleHeight: 3,
    Offset: 5,
    SurfaceBlock: 5,
    SubsurfaceBlock: 2,
    LiquidBlock: 4
};

var BiomeSwamp = {
    CourseScaleCompression: 0.1,
    CourseScaleHeight: 2,
    FineScaleCompression: 0.21,
    FineScaleHeight: 1,
    Offset: 0,
    SurfaceBlock: 2,
    SubsurfaceBlock: 2,
    LiquidBlock: 13
};

var BiomeBadlands = {
    CourseScaleCompression: 0.03,
    CourseScaleHeight: 10,
    FineScaleCompression: 0.05,
    FineScaleHeight: 3,
    Offset: 10,
    SurfaceBlock: 10,
    SubsurfaceBlock: 10,
    LiquidBlock: 0
};

var BiomeLavaPit = {
	CourseScaleCompression: 0.1,
    CourseScaleHeight: 10,
    FineScaleCompression: 0.3,
    FineScaleHeight: 1,
    Offset: -1,
    SurfaceBlock: 11,
    SubsurfaceBlock: 11,
    LiquidBlock: 9
};

var BiomeDeepOcean = {
    CourseScaleCompression: 0.007,
    CourseScaleHeight: 6,
    FineScaleCompression: 0.04,
    FineScaleHeight: 2,
    Offset: -11,
    SurfaceBlock: 5,
    SubsurfaceBlock: 5,
    LiquidBlock: 4
};

var BiomeJungle = {
    CourseScaleCompression: 0.03,
    CourseScaleHeight: 5,
    FineScaleCompression: 0.05,
    FineScaleHeight: 3,
    Offset: 1,
    SurfaceBlock: 2,
    SubsurfaceBlock: 2,
    LiquidBlock: 13
};

var BiomeGreenMountains = {
    CourseScaleCompression: 0.01,
    CourseScaleHeight: 32,
    FineScaleCompression: 0.05,
    FineScaleHeight: 6,
    Offset: 13,
    SurfaceBlock: 1,
    SubsurfaceBlock: 1,
    LiquidBlock: 4
}; 

var BiomeIslands = {
    CourseScaleCompression: 0.025,
    CourseScaleHeight: 10,
    FineScaleCompression: 0.03,
    FineScaleHeight: 5,
    Offset: -4,
    SurfaceBlock: 5,
    SubsurfaceBlock: 5,
    LiquidBlock: 4
}; 


// reefs, islands, highlands, tundra, Zhangjiajie (towering rocks), coniferous, dead land (corrupted), 
// sky islands and cloud cities, mushroom forest, ice towers, hell, fjords


function PlaceTreeBox(baseX, baseY, baseZ, trunkHeight, leafWidth, leafHeight, leafPercent = 1, leafBlock = 7, fruitPercent = 0, fruitBlock = 18){
        
    // Trunk
    for(let y = baseY; y < baseY + trunkHeight; y++){
        SetBlockData(baseX, y, baseZ, 6);
    }
    
    // Leaves
    for(let x = baseX - leafWidth; x <= baseX + leafWidth; x++){
        for(let y = baseY + trunkHeight; y <= baseY + trunkHeight + leafHeight; y++){
            for (let z = baseZ - leafWidth; z <= baseZ + leafWidth; z++){
                if (GetBlockData(x, y, z) === 0) {
                    if (RandomChance(leafPercent)) {
                        SetBlockData(x, y, z, leafBlock);
                    }
                    if (RandomChance(fruitPercent)) {
                        SetBlockData(x, y, z, fruitBlock);
                    }
                }     
            }
        }
    }
}


function PlaceTreeCone(baseX, baseY, baseZ, height, radius, leafBase, leafPercent = 1, leafBlock = 7, fruitPercent = 0, fruitBlock = 18) {

    height = Math.round(height);
    radius = Math.round(radius);
    leafBase = Math.round(leafBase);

    // Trunk
    for (let y = baseY; y < baseY + height; y++) {
        SetBlockData(baseX, y, baseZ, 6);
    }

    // Leaves
    for (let y = baseY + leafBase; y <= baseY + height + 1; y++) {

        let radGradient = (baseY + height + 1 - y) / height;
        let thisWidth = Math.round(radGradient * radius);

        for (let x = baseX - thisWidth; x <= baseX + thisWidth; x++) {
            for (let z = baseZ - thisWidth; z <= baseZ + thisWidth; z++) {

                // Only place blocks in a circular radius, and only a certain percent
                let xDist = x - baseX;
                let zDist = z - baseZ;
                if (xDist * xDist + zDist * zDist <= thisWidth * thisWidth) {

                    if (GetBlockData(x, y, z) === 0) {
                        if (RandomChance(leafPercent)) {
                            SetBlockData(x, y, z, leafBlock);
                        }
                        if (RandomChance(fruitPercent)) {
                            SetBlockData(x, y, z, fruitBlock);
                        }
                    }
                }
                
            }
        }
    }    
}


function PlaceTreeBall(baseX, baseY, baseZ, height, radius, leafPercent = 1, leafBlock = 7, fruitPercent = 0, fruitBlock = 18) {

    height = Math.round(height);
    radius = Math.round(radius);

    // Trunk
    for (let y = baseY; y < baseY + height; y++) {
        SetBlockData(baseX, y, baseZ, 6);
    }

    // Leaves
    for (let y = baseY + height - radius; y <= baseY + height + radius; y++) {
        for (let x = baseX - radius; x <= baseX + radius; x++) {
            for (let z = baseZ - radius; z <= baseZ + radius; z++) {

                // Only place leaves in a spherical radius, and only a certain percentage of them
                let xDistSq = Math.pow(baseX - x, 2);
                let zDistSq = Math.pow(baseZ - z, 2);
                let yDistSq = Math.pow(baseY + height - y, 2);

                if (xDistSq + zDistSq + yDistSq <= radius * radius) {

                    if (GetBlockData(x, y, z) === 0) {
                        if (RandomChance(leafPercent)) {
                            SetBlockData(x, y, z, leafBlock);
                        }
                        if (RandomChance(fruitPercent)) {
                            SetBlockData(x, y, z, fruitBlock);
                        }
                    }
                }
                             
            }
        }
    }
}



function PlaceGroundCover(baseX, baseY, baseZ, blockID) {
    SetBlockData(baseX, baseY, baseZ, blockID);
}

function PlaceTrunk(baseX, baseY, baseZ, height, blockID) {    
    for (let y = baseY; y < baseY + height; y++) {
        SetBlockData(baseX, y, baseZ, blockID);
    }
}


function GenerateOres(oreBlocksID, defaultOreProbabilities, desiredDepthRanges, defaultSeedDensity, densityDepthMultiplier, _heightMap){
    // Randomly place ore seeds below the surface. Seeds are evenly distrubuted, but the ore type is weighted

    for (let x = 0; x < worldWidth; x++) {
        for (let z = 0; z < worldWidth; z++) {
            let terrainHeight = _heightMap[x][z];
            for (let y = 0; y <= terrainHeight; y++) {
                // Seed an ore block here if the block is stone and the random chance is true
                let currentDepthPercent = 1 - (y / terrainHeight);
                let seedFrequency = defaultSeedDensity * MapRange(currentDepthPercent, 0, 1, 1, densityDepthMultiplier);
                
                if (RandomChance(seedFrequency) && GetBlockData(x, y, z) == 1) {
                    // Compensates ore spawn chances based on each ore's probablity spread at depth
                    let currentOreProbabilities = new Array(defaultOreProbabilities.length);
                    for(let o = 0; o < oreBlocksID.length; o++){
                        let center = desiredDepthRanges[o][0];
                        let radius = desiredDepthRanges[o][1];

                        let probablityMult = 1 - (Math.abs(center - currentDepthPercent) / radius)
                        probablityMult = ClampValue(probablityMult, 0, 1);

                        currentOreProbabilities[o] = probablityMult * defaultOreProbabilities[o];
                    }

                    let oreType = oreBlocksID[WeightedRandomChoice(currentOreProbabilities)];
                    
                    SetBlockData(x, y, z, oreType);
                }
            }   
        }       
    }
}


function GenerateCaves(threshold, compression, heightMap) {
    var caveMap = Create2DArray(worldWidth, worldWidth);

	for (let x = 0; x < worldWidth; x++) {
		for (let y = 0; y < worldHeight; y++) {
            for (let z = 0; z < worldWidth; z++) {	
                // Creates caves only in stone
                if (GetBlockData(x, y, z) == 1) {
                    
                    let surroundingBlocks = [
                        GetBlockData(x, y + 1, z),
                        GetBlockData(x, y - 1, z),
                        GetBlockData(x, y, z + 1),
                        GetBlockData(x, y, z - 1),
                        GetBlockData(x + 1, y, z),
                        GetBlockData(x - 1, y, z)
                    ];

                    // Ignore this block if it touches water or lava
                    let liquidAdjacent = false;
                    for (let i = 0; i < surroundingBlocks.length; i++){
                        if (liquidID.includes(surroundingBlocks[i])){
                            liquidAdjacent = true;
                        }
                    }
                    if (!liquidAdjacent) {
                        let noiseValue = noise.simplex3(x * compression / 100, y * compression / 100, z * compression / 100);

                        if (noiseValue > threshold) {
                            SetBlockData(x, y, z, 0);
                            if (y == heightMap[x][z]) {
                                caveMap[x][z] = 1;
                            }
                        }
                    }
				}
			}
        }       
    }
    return caveMap;
}

function SetRectVolume(xLow, xHigh, yLow, yHigh, zLow, zHigh, thisID) {
    for (let x = xLow; x <= xHigh; x++) {
        for (let y = yLow; y <= yHigh; y++) {
            for (let z = zLow; z <= zHigh; z++) {
                SetBlockData(x, y, z, thisID);
            }
        }
    }    
}

function PlaceHouseBasic(cornerX, cornerY, cornerZ, length, height, width, doorSide, floorID, wallID, roofID) {
    let pad = 2;
    SetRectVolume(cornerX - pad, cornerX + length + pad - 1, cornerY, cornerY + height + pad, cornerZ - pad, cornerZ + width + pad - 1, 0);

    // Places a floor at the base and extending out to the padding edge
    for (let x = cornerX - pad; x < cornerX + length + pad; x++) {
        for (let z = cornerZ - pad; z < cornerZ + width + pad; z++) {
            SetBlockData(x, cornerY, z, floorID);
        }
    }
    // Roof
    for (let x = cornerX; x < cornerX + length; x++) {
        for (let z = cornerZ; z < cornerZ + width; z++) {
            SetBlockData(x, cornerY + height - 1, z, roofID);
        }
    }
    

    // Builds x and z side walls
    for (let y = cornerY + 1; y < cornerY + height - 1; y++) {
        for (let x = cornerX; x < cornerX + length; x++) {
            SetBlockData(x, y, cornerZ, wallID);
            SetBlockData(x, y, cornerZ + width - 1, wallID);
        }
    }
    for (let y = cornerY + 1; y < cornerY + height - 1; y++) {
        for (let z = cornerZ; z < cornerZ + width; z++) {
            SetBlockData(cornerX, y, z, wallID);
            SetBlockData(cornerX + length - 1, y, z, wallID);
        }
    }

    // Carves out a door in the middle of a given wall
    switch (doorSide) {
        // Close x side
        case 0:
            SetBlockData(cornerX, cornerY + 1, cornerZ + Math.trunc(width / 2), 0);
            SetBlockData(cornerX, cornerY + 2, cornerZ + Math.trunc(width / 2), 0);
            SetBlockData(cornerX, cornerY + 3, cornerZ + Math.trunc(width / 2), 0);

            SetBlockData(cornerX, cornerY + 1, cornerZ + Math.trunc(width / 2) + 1, 0);
            SetBlockData(cornerX, cornerY + 2, cornerZ + Math.trunc(width / 2) + 1, 0);
            SetBlockData(cornerX, cornerY + 3, cornerZ + Math.trunc(width / 2) + 1, 0);
            break;
        // Close z side
        case 1:
            SetBlockData(cornerX + Math.trunc(length / 2), cornerY + 1, cornerZ, 0);
            SetBlockData(cornerX + Math.trunc(length / 2), cornerY + 2, cornerZ, 0);
            SetBlockData(cornerX + Math.trunc(length / 2), cornerY + 3, cornerZ, 0);

            SetBlockData(cornerX + Math.trunc(length / 2) + 1, cornerY + 1, cornerZ, 0);
            SetBlockData(cornerX + Math.trunc(length / 2) + 1, cornerY + 2, cornerZ, 0);
            SetBlockData(cornerX + Math.trunc(length / 2) + 1, cornerY + 3, cornerZ, 0);
            break;
        // Far x side
        case 2:
            SetBlockData(cornerX + length - 1, cornerY + 1, cornerZ + Math.trunc(width / 2), 0);
            SetBlockData(cornerX + length - 1, cornerY + 2, cornerZ + Math.trunc(width / 2), 0);
            SetBlockData(cornerX + length - 1, cornerY + 3, cornerZ + Math.trunc(width / 2), 0);

            SetBlockData(cornerX + length - 1, cornerY + 1, cornerZ + Math.trunc(width / 2) + 1, 0);
            SetBlockData(cornerX + length - 1, cornerY + 2, cornerZ + Math.trunc(width / 2) + 1, 0);
            SetBlockData(cornerX + length - 1, cornerY + 3, cornerZ + Math.trunc(width / 2) + 1, 0);
            break;
        // Far z side
        case 3:
            SetBlockData(cornerX + Math.trunc(length / 2), cornerY + 1, cornerZ + width - 1, 0);
            SetBlockData(cornerX + Math.trunc(length / 2), cornerY + 2, cornerZ + width - 1, 0);
            SetBlockData(cornerX + Math.trunc(length / 2), cornerY + 3, cornerZ + width - 1, 0);

            SetBlockData(cornerX + Math.trunc(length / 2) + 1, cornerY + 1, cornerZ + width - 1, 0);
            SetBlockData(cornerX + Math.trunc(length / 2) + 1, cornerY + 2, cornerZ + width - 1, 0);
            SetBlockData(cornerX + Math.trunc(length / 2) + 1, cornerY + 3, cornerZ + width - 1, 0);
            break;
        // Defaults to the first case otherwise
        default:
            break;
    }
	
	// Legs
	let cX = cornerX - pad
	let cY = cornerY - 1
	let cZ = cornerZ - pad
	let blockBelow = GetBlockData(cX, cY, cZ);
	while (cY > 0 && (blockBelow === 0 || blockBelow === 4)){
		SetBlockData(cX, cY, cZ, 6);
		cY -= 1;
		blockBelow = GetBlockData(cX, cY, cZ);
	}
	
	cX = cornerX + length + pad - 1
	cY = cornerY - 1
	cZ = cornerZ - pad
	blockBelow = GetBlockData(cX, cY, cZ);
	while (cY > 0 && (blockBelow === 0 || blockBelow === 4)){
		SetBlockData(cX, cY, cZ, 6);
		cY -= 1;
		blockBelow = GetBlockData(cX, cY, cZ);
	}
	
	cX = cornerX - pad
	cY = cornerY - 1
	cZ = cornerZ + width + pad - 1
	blockBelow = GetBlockData(cX, cY, cZ);
	while (cY > 0 && (blockBelow === 0 || blockBelow === 4)){
		SetBlockData(cX, cY, cZ, 6);
		cY -= 1;
		blockBelow = GetBlockData(cX, cY, cZ);
	}
	
	cX = cornerX + length + pad - 1
	cY = cornerY - 1
	cZ = cornerZ + width + pad - 1
	blockBelow = GetBlockData(cX, cY, cZ);
	while (cY > 0 && (blockBelow === 0 || blockBelow === 4)){
		SetBlockData(cX, cY, cZ, 6);
		cY -= 1;
		blockBelow = GetBlockData(cX, cY, cZ);
	}
    
}

function PlaceCloudEmpty(x, y, z, radius){
	SetRectVolume(x, x + radius, y, y + radius, z, z + radius, 14);
}

function PlaceCloudLayer(height, thickness, threshold, compression) {
    let cloudMap = Create2DArray(worldWidth, worldWidth);

    for (let y = height; y > height - thickness; y--) {
        for (let x = 1; x < worldWidth-1; x++) {
            for (let z = 1; z < worldWidth-1; z++) {
                if (GetBlockData(x, y, z) == 0) {

                    let noiseValue = noise.simplex3(x * compression / 100, y * compression / 100, z * compression / 100);

                    if (noiseValue > threshold) {
                        SetBlockData(x, y, z, 14);
                        // Cloud map stores the top layer of the clouds as true or false for each x and y
                        if (y === height) {
                            cloudMap[x][z] = 1;
                        }
                    }
                }
            }
        }
    }

    return cloudMap;
}
