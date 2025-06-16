const { spawn } = require('child_process');


module.exports = {
    restartBot() {
        spawn(process.argv[0], process.argv.slice(1), {
            detached: true,
            stdio: 'inherit'
        });
        process.exit();
    },
    upsampleFrame(frame) {
        // If frame is 960 bytes (480 samples), duplicate each byte to get 1920
        const upsampled = Buffer.alloc(1920);
    
        for (let i = 0; i < 960; i += 2) {
            // Read 16-bit sample
            const sample = frame.readInt16LE(i);
            // Duplicate the sample (write twice)
            upsampled.writeInt16LE(sample, i * 2);
            upsampled.writeInt16LE(sample, i * 2 + 2);
        }
    
        return upsampled;
    }

}