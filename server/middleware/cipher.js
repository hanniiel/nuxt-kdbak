const Rijndael = require('rijndael-js');
const crypto = require('crypto');

const cipher = async(req,res,next)=>{
    try{
        // Key can be 16/24/32 bytes long (128/192/256 bit)
        const key = 'myprivatekeyjeje';
        // Plaintext will be zero-padded
        const original = 'loll';
        // IV is necessary for CBC mode
        // IV should have same length with the block size
        const iv = crypto.randomBytes(24).toString("base64");//+8 bytes added
        req.iv= iv;
        res.header("IV",iv);
        // Create Rijndael instance
        // `new Rijndael(key, mode)`
        const cipher = new Rijndael(key, 'cbc');
        // `Rijndael.encrypt(plaintext, blockSize[, iv]) -> <Array>`
        // Output will always be <Array> where every element is an integer <Number>
        const ciphertext = Buffer.from(cipher.encrypt(original, iv.length*8, iv));
        req.kk = ciphertext.toString("base64");
        // -> bmwLDaLiI1k0oUu5wx9dlWs+Uuw3IhIkMYvq0VsVlQY66wAAqS0djh8N+SZJNHsv8wBRfhytRX2p9LJ0GT3sig==
        // `Rijndael.decrypt(ciphertext, blockSize[, iv]) -> <Array>`
        const plaintext = Buffer.from(cipher.decrypt(ciphertext, iv.length*8, iv));
        original === plaintext.toString();
        req.oo = plaintext.toString();
        next()

    }catch(error){
        res.send({error});
    }
};


module.exports = cipher;