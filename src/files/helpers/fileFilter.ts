export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    // console.log({ file });
    
    //primer argumento evalua el archivo y el segundo es el boolean
    // de si es o no permitido
    //si el file viene vacio no esta permitido
    if(!file) return callback(new Error('File is empty'), false);

    const fileExt = file.mimetype.split('/')[1];
    const validExt = ['jpg', 'jpeg', 'png', 'gif'];

    if(validExt.includes(fileExt)){
        return callback(null, true);
    }

    callback(null, false);
}