import { describe, it, expect } from 'vitest';
import {
  renderDynamicField,
  FieldDefinition,
} from '../../templates/components/dynamic-field.template';

describe('renderDynamicField - Media', () => {
  const baseField: FieldDefinition = {
    id: 'test-field',
    field_name: 'media_field',
    field_type: 'media',
    field_label: 'Media Field',
    field_options: {},
    field_order: 1,
    is_required: false,
    is_searchable: false,
  };

  it('should render single media field correctly', () => {
    const html = renderDynamicField(baseField, { value: 'https://example.com/image.jpg' });

    expect(html).toContain('id="field-media_field"');
    expect(html).toContain('value="https://example.com/image.jpg"');
    expect(html).toContain('data-multiple="false"');
    expect(html).toContain('<img src="https://example.com/image.jpg"');
    expect(html).toContain('Select Media');
    expect(html).not.toContain('Select Media (Multiple)');
  });

  it('should render multiple media field correctly', () => {
    const multipleField = { ...baseField, field_options: { multiple: true } };
    const values = ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'];
    const html = renderDynamicField(multipleField, { value: values });

    expect(html).toContain('data-multiple="true"');
    expect(html).toContain('value="https://example.com/img1.jpg,https://example.com/img2.jpg"');
    expect(html).toContain('Select Media (Multiple)');
    expect(html).toContain('media-preview-grid');
    expect(html).toContain('grid-cols-4');
    // Should render two items
    expect(html.match(/media-preview-item/g)?.length).toBe(2);
  });

  it('should render video preview for video files', () => {
    const html = renderDynamicField(baseField, { value: 'https://example.com/video.mp4' });

    expect(html).toContain('<video src="https://example.com/video.mp4"');
    expect(html).toContain('muted');
    expect(html).not.toContain('<img src="https://example.com/video.mp4"');
  });

  it('should render mixed image and video previews in multiple mode', () => {
    const multipleField = { ...baseField, field_options: { multiple: true } };
    const values = ['https://example.com/image.jpg', 'https://example.com/video.mp4'];
    const html = renderDynamicField(multipleField, { value: values });

    expect(html).toContain('<img src="https://example.com/image.jpg"');
    expect(html).toContain('<video src="https://example.com/video.mp4"');
  });

  it('should handle empty values in multiple mode', () => {
    const multipleField = { ...baseField, field_options: { multiple: true } };
    const html = renderDynamicField(multipleField, { value: [] });

    expect(html).toContain('value=""');
    expect(html).toContain('hidden'); // Preview grid should be hidden
  });
});
