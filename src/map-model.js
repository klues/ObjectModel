import { BasicModel as Model, initModel, checkDefinition, checkAssertions } from "./basic-model"
import { setConstructor, setConstructorProto, toString } from "./helpers"

const MAP_MUTATOR_METHODS = ["set", "delete", "clear"]

function MapModel(def){

	const model = function(iterable) {
		const map = new Map(iterable)
		model.validate(map)

		for(let method of MAP_MUTATOR_METHODS){
			map[method] = function() {
				const testMap = new Map(map)
				Map.prototype[method].apply(testMap, arguments)
				model.validate(testMap)
				return Map.prototype[method].apply(map, arguments)
			}
		}

		setConstructor(map, model)
		return map
	}

	setConstructorProto(model, Map.prototype)
	initModel(model, def, MapModel)
	return model
}

setConstructorProto(MapModel, Model.prototype)
Object.assign(MapModel.prototype, {

	toString(stack){
		return "Map of " + toString(this.definition, stack)
	},

	_validate(map, path, errorStack, callStack){
		if(map instanceof Map){
			for(let [key,val] of map){
				checkDefinition(val, this.definition, `${path || "Map"}[${key}]`, errorStack, callStack)
			}
		} else {
			errorStack.push({
				expected: this,
				received: map,
				path
			})
		}
		checkAssertions(map, this, errorStack)
	}
})

Model.Map = MapModel
export default MapModel