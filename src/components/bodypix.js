import '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import RedSpinner from './hooks/spinner';

const Remove = () => {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const loadImage = () => {
        const img = new Image();
        img.src = process.env.PUBLIC_URL + '/girl.jpeg'

        const ctx = canvasRef.current.getContext('2d');

        img.addEventListener('load', () => {
            canvasRef.current.width = img.width;
            canvasRef.current.height = img.height;
            ctx.drawImage(img, 0, 0)
        })
    }

    const backgroundRemoval = async () => {
        setLoading(true);

        const canvas = canvasRef.current;
        const net = await bodyPix.load({
            architecture: 'ResNet50',
            outputStride: 32,
            quantBytes: 4
        })
        const segmentation = await net.segmentPerson(canvas, {
            internalResolution: 'medium',
            segmentationThreshold: 0.7,
            scoreThreshold: 0.7
        })
        const ctx = canvas.getContext('2d');
        const { data: imgData } = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const newImg = ctx.createImageData(canvas.width, canvas.height)
        const newImgData = newImg.data;

        segmentation.data.forEach((segment, i) => {
            if (segment === 1) {
                newImgData[i*4] = imgData[i*4]
                newImgData[i*4+1] = imgData[i*4+1]
                newImgData[i*4+2] = imgData[i*4+2]
                newImgData[i*4+3] = imgData[i*4+3]
            }
        })

        ctx.putImageData(newImg, 0, 0)
        setLoading(false);
    }

    useEffect(() => {
        loadImage();
    }, [])

    return (
        <div>
            <canvas ref={canvasRef}/>
            <div>
                {loading ? <div>
                    <h2>로딩중...</h2>
                    <RedSpinner loading={loading} />
                </div> : null}
            </div>
            <button onClick={backgroundRemoval}>제거</button>
        </div>
    )
}

export default Remove;