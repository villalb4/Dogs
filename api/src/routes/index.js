const { Router} = require('express');
const axios = require('axios');
const {Dog, Temperament} = require("../db.js")
const {API, API_SEARCH, API_KEY} = process.env

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);




router.get('/search', async(req, res, next) => {
  const {name} = req.query;
  if(!name){
    return res
      .status(400)
      .send({msg: "Falta enviar datos obligatorios"})
  }
  try {
    const dogApi = (await axios.get(`${API}?api_key=${API_KEY}`)).data
    const dogDb = await Dog.findAll({where: {name: name}, include: Temperament})

    const allDog = await [...dogApi, ...dogDb]
  
    const dog = await allDog.filter(d => d.name.toLowerCase().includes(name.toLowerCase()))
      
    return res
      .status(200)
      .send(dog)
  } catch (error) {
    next(error)
  }
})




router.get('/dogs', async(req, res, next) => {
  try {
    const dogApi = (await axios.get(`${API}?api_key=${API_KEY}`)).data
    const apiFormateo = dogApi.map(dog => {
      return {
        id: dog.id,
        image: dog.image.url,
        name: dog.name,
        weight_min: dog.weight.metric.slice(0, 2).trim(),
        weight_max: dog.weight.metric.slice(-2).trim(),
        temperament: dog.temperament
      }
    })

    const validando = await apiFormateo.map(d => {
      if(!d.weight_min || d.weight_min === "Na") {
        if(!d.weight_max || d.weight_max === "Na") {
          d.weight_min = "8"
        } else {
          d.weight_min = (d.weight_max - 2).toString();
        }
      }
      
      if(!d.weight_max || d.weight_max === "Na") {
        if(!d.weight_min || d.weight_min === "Na") {
          d.weight_max = "12"
        } else {
          d.weight_max = (parseInt(d.weight_min) + 7).toString();
        }
      }

      if(!d.temperament) {
        d.temperament = "Stubborn, Active, Happy, Dutiful, Confident"
      }

      return d
    })
    
    const dogDb = await Dog.findAll({include: Temperament});

    const dbFormateo = dogDb.map(dog => {
      return {
        id: dog.id,
        image: dog.image,
        name: dog.name,
        weight_min: dog.weight_min,
        weight_max: dog.weight_max,
        temperament: dog.temperaments
      }
    })

    const dogs = [...validando, ...dbFormateo];
    
    res.json(dogs)

  } catch (error) {
    next(error)
  }
})




router.post('/dogs', async(req, res) => {
  const {name, height_min, height_max, weight_min, weight_max, temperament} = req.body;
  if(!name || !height_min || !height_max || !weight_min || !weight_max) {
    return res
      .status(400)
      .send({msg: "Falta enviar datos obligatorios"})
  }
  try {
    const dog = await Dog.create(req.body)

    let tempDb = await Temperament.findAll({
      where: {id : temperament}
    })

    await dog.addTemperament(temperament)

    return res
      .status(201)
      .send({msg: "Perro creado correctamente"})
  } catch (error) {
    // next(error)
    console.log(error)
  }
})




router.get('/temperaments', async(req, res, next)=> {
  try {
    const temperamentos = (await axios.get(`${API}?api_key=${API_KEY}`)).data
    const formateo = temperamentos.map(t => t.temperament)
    const uniendo = formateo.filter(r => r != null)
    .join().split(", ").join().split(",")

    let resultado = uniendo.reduce((a, e) => {
      if(!a.find(d => d == e)) a.push(e)
      return a
    }, []);

    resultado = resultado.map(t => {return{name: t}})

    // console.log("RESULTADO: ", resultado)

    const allTemps = await Temperament.findAll()

    
    
    if(allTemps.length === 0) {
      await Temperament.bulkCreate(resultado)
    } 
    const temper = await Temperament.findAll()
      
    res.send(temper)

  } catch (error) {
    next(error)
  }
})




router.get('/dogs/:idRaza', async(req, res, next) => {
  const {idRaza} = req.params;
  if(!idRaza) {
    return res
      .status(400)
      .send({msg: "Falta enviar datos obligatorios"})
  }
  try {
    const dogApi = (await axios.get(`${API}?api_key=${API_KEY}`)).data
    //formateando la api para traer solo los datos necesarios para la ruta pricipal
    const apiFormateo = await dogApi.map(dog => {
      return {
        id: dog.id,
        image: dog.image.url,
        name: dog.name,
        weight_min: dog.weight.metric.slice(0, 2).trim(),
        weight_max: dog.weight.metric.slice(-2).trim(),
        height_min: dog.height.metric.slice(0, 2).trim(),
        height_max: dog.height.metric.slice(4).trim(),
        life_span_min: dog.life_span.slice(0, 2).trim(),
        life_span_max: dog.life_span.slice(4, -6).trim(),
        // life_span_max: parseInt(dog.life_span.slice(4).trim()),
        temperament: dog.temperament
      }
    })

    const validando = await apiFormateo.map(d => {
      if(!d.weight_min || d.weight_min === "Na") {
        if(!d.weight_max || d.weight_max === "Na") {
          d.weight_min = "8"
        } else {
          d.weight_min = (d.weight_max - 2).toString();
        }
      }
      
      if(!d.weight_max || d.weight_max === "Na") {
        if(!d.weight_min || d.weight_min === "Na") {
          d.weight_max = "12"
        } else {
          d.weight_max = (parseInt(d.weight_min) + 7).toString();
        }
      }

      if(!d.height_min || d.weight_min === "Na") {
        if(!d.height_max || d.weight_max === "Na") {
          d.height_min = "7"
        } else {
          d.height_min = (d.height_max - 4).toString();
        }
      }

      if(!d.height_max || d.weight_max === "Na") {
        if(!d.height_min || d.weight_min === "Na") {
          d.height_max = "13"
        } else {
          d.height_max = (parseInt(d.height_min) + 6).toString();
        }
      }

      if(!d.life_span_max) {
        if(!d.life_span_min){
          d.life_span_max = "7"
        } else {
          d.life_span_max = (parseInt(d.life_span_min) + 4).toString();
        }
      }

      if(!d.life_span_min) {
        if(!d.life_span_max){
          d.life_span_min = "7"
        } else {
          d.life_span_min = (parseInt(d.life_span_max) + 4).toString();
        }
      }

      if(!d.temperament) {
        d.temperament = "Stubborn, Active, Happy, Dutiful, Confident"
      }

      return d
    })

    const dogDb = await Dog.findAll({include: Temperament});

    const dbFormateo = await dogDb.map(dog => {
      return {
        id: dog.id,
        image: dog.image,
        name: dog.name,
        weight_min: dog.weight_min,
        weight_max: dog.weight_max,
        height_min: dog.height_min,
        height_max: dog.height_max,
        life_span_min: dog.life_span_min,
        life_span_max: dog.life_span_max,
        temperament: dog.temperaments
      }
    })

    const allDog = [...validando, ...dbFormateo];

    const dog = allDog.filter(d => d.id == idRaza)

    return res
      .status(200)
      .send(dog)
  } catch (error) {
    next(error)
  }
})


module.exports = router;