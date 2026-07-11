import React from 'react';
import { Box, Typography } from '@mui/material';

interface BarcodeViewerProps {
  value: string;
  width?: number;
  height?: number;
}

export const BarcodeViewer: React.FC<BarcodeViewerProps> = ({
  value,
  width = 280,
  height = 70,
}) => {
  // Generate a mock but realistic-looking barcode pattern based on string characters
  const generateBarcodeLines = () => {
    const lines = [];
    let position = 10;
    const str = value || 'GATEOS-12345';
    
    // Seeded random-like generation based on characters of the ticket code
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      const pattern = [
        (charCode % 2) + 1,
        ((charCode >> 1) % 2) + 1,
        ((charCode >> 2) % 2) + 1,
        ((charCode >> 3) % 2) + 1,
      ];
      
      for (let j = 0; j < pattern.length; j++) {
        const thickness = pattern[j];
        const isBar = j % 2 === 0;
        if (isBar) {
          lines.push(
            <rect
              key={`bar-${i}-${j}`}
              x={position}
              y={5}
              width={thickness * 1.5}
              height={height - 20}
              fill="#000"
            />
          );
        }
        position += thickness * 1.5 + 1.5;
      }
    }
    
    // Add start and stop bars
    lines.unshift(<rect key="start-1" x={4} y={5} width={2} height={height - 20} fill="#000" />);
    lines.unshift(<rect key="start-2" x={8} y={5} width={2} height={height - 20} fill="#000" />);
    lines.push(<rect key="stop-1" x={position + 2} y={5} width={2} height={height - 20} fill="#000" />);
    lines.push(<rect key="stop-2" x={position + 6} y={2} width={2} height={height - 20} fill="#000" />);
    
    return { lines, totalWidth: position + 12 };
  };

  const { lines, totalWidth } = generateBarcodeLines();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      <Box
        sx={{
          bgcolor: '#fff',
          p: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          width: 'fit-content',
        }}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${totalWidth} ${height}`}
          style={{ display: 'block', maxWidth: '100%' }}
        >
          {lines}
        </svg>
      </Box>
      <Typography variant="caption" sx={{ fontFamily: 'monospace', letterSpacing: 3, fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Box>
  );
};
